import {MobxLitElement} from '@adobe/lit-mobx';
import {CSSResultGroup, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {core} from '../../core/core';
import {CohortService} from '../../services/cohort.service';
import {ParticipantService} from '../../services/participant.service';
import {getParticipantName} from '../../shared/participant.utils';

import {
  ChipItem,
  ChipRevealItem,
  ChipStagePublicData,
  ChipStageConfig,
  ParticipantProfile,
  RevealAudience,
  StageKind,
} from '@deliberation-lab/utils';
import {isActiveParticipant} from '../../shared/participant.utils';
import {styles} from './chip_reveal_view.scss';
import {SurveyAnswer} from '@deliberation-lab/utils';
import {
  N_INITIAL_BLUE_CHIPS,
  N_INITIAL_GREEN_CHIPS,
  N_INITIAL_RED_CHIPS,
} from '../../shared/games/chip_negotiation';

/** Chip negotiation reveal view */
@customElement('chip-reveal-view')
export class ChipReveal extends MobxLitElement {
  static override styles: CSSResultGroup = [styles];

  private readonly cohortService = core.getService(CohortService);
  private readonly participantService = core.getService(ParticipantService);

  @property() stage: ChipStageConfig | undefined = undefined;
  @property() publicData: ChipStagePublicData | undefined = undefined;

  // Use chip reveal item to determine whether or not to show
  // chip values
  @property() item: ChipRevealItem | undefined = undefined;

  @property() showTitle = false;

  override render() {
    if (!this.stage) {
      return nothing;
    }

    const renderTitle = () => {
      if (!this.showTitle) {
        return nothing;
      }
      return html`<h2>Results for <b>${this.stage?.name}</b> stage</h2>`;
    };

    const currentParticipant = this.participantService.profile;
    const participants =
      this.item?.revealAudience === RevealAudience.CURRENT_PARTICIPANT
        ? currentParticipant
          ? [currentParticipant]
          : []
        : this.cohortService.getAllParticipants();

    return html`
      ${renderTitle()} ${this.renderGlobalTable(participants)}
      <div class="divider"></div>
    `;
  }

  private makeCell(content: string) {
    return html`<div class="table-cell">${content}</div>`;
  }

  private renderGlobalTableHeader() {
    if (!this.stage) return nothing;

    const currentParticipant = this.participantService.profile;
    if (!this.publicData || !currentParticipant) return nothing;

    const participantChipMap =
      this.publicData?.participantChipMap[currentParticipant.publicId] ?? {};
    const participantChipValueMap =
      this.publicData?.participantChipValueMap[currentParticipant.publicId] ??
      {};

    // Get chip values for the current participant
    const chipValues = this.stage?.chips.map((chip) => {
      const quantity = participantChipMap[chip.id] ?? 0;
      const value = participantChipValueMap[chip.id] ?? 0;
      return {chip, quantity, value};
    });

    const totalPayout = chipValues
      ?.reduce((total, {quantity, value}) => total + quantity * value, 0)
      .toFixed(2);

    return html`
      <div class="table-head">
        <div class="table-row">
          ${this.makeCell('participant')}
          ${chipValues.map(
            (chip) =>
              html`<div class="table-cell">
                ${chip.chip.name}<br />($${chip.value} for
                ${chip.chip.name.includes('green') ? 'all' : 'you'})
              </div>`
          )}
        </div>
      </div>
    `;
  }

  private renderParticipantRow(participant: ParticipantProfile) {
    if (!this.publicData) return nothing;

    const isCurrentUser =
      participant.publicId! === this.participantService.profile!.publicId;

    const isCurrentTurn = (participant: ParticipantProfile) => {
      if (this.publicData?.kind !== StageKind.CHIP) return false;

      return (
        this.publicData.currentTurn?.participantId === participant.publicId
      );
    };

    const renderChip = (chip: ChipItem, isCurrentUser: boolean) => {
      const participantChipMap =
        this.publicData?.participantChipMap[participant.publicId] ?? {};

      const cellContent = participantChipMap[chip.id]?.toString() ?? '';
      return this.makeCell(cellContent);
    };

    const participantIndicator = html`<span
        class="indicator ${isCurrentTurn(participant) ? '' : 'hidden'}"
        >👉</span
      >${participant.avatar}
      ${getParticipantName(participant)}${isCurrentUser ? ' (you)' : ''}`;

    return html`
      <div class="table-row ${isCurrentUser ? 'highlight' : ''}">
        <div class="table-cell participant-cell">${participantIndicator}</div>
        ${this.stage?.chips.map((chip) => renderChip(chip, isCurrentUser))}
      </div>
    `;
  }

  private renderGlobalTable(participants: ParticipantProfile[]) {
    const currentParticipant = this.participantService.profile;
    if (!this.publicData || !currentParticipant) return nothing;

    const participantChipMap =
      this.publicData?.participantChipMap[currentParticipant.publicId] ?? {};
    const participantChipValueMap =
      this.publicData?.participantChipValueMap[currentParticipant.publicId] ??
      {};

    // Get chip values for the current participant
    const chipValues = this.stage?.chips.map((chip) => {
      const quantity = participantChipMap[chip.id] ?? 0;
      const value = participantChipValueMap[chip.id] ?? 0;
      return {chip, quantity, value};
    });

    // Calculate the initial payout as a sum
    const initialPayout = this.stage?.chips.reduce((sum, chip) => {
      let initialQuantity = 0;
      console.log(chip.id);
      if (chip.id === 'BLUE') {
        initialQuantity = N_INITIAL_BLUE_CHIPS;
      } else if (chip.id === 'RED') {
        initialQuantity = N_INITIAL_RED_CHIPS;
      } else if (chip.id === 'GREEN') {
        initialQuantity = N_INITIAL_GREEN_CHIPS;
      }

      const value = participantChipValueMap[chip.id] ?? 0;
      return sum + initialQuantity * value;
    }, 0);

    const totalPayout = chipValues?.reduce(
      (total, {quantity, value}) => total + quantity * value,
      0
    );
    const diff = totalPayout! - initialPayout!;
    const diffDisplay = html`<span
      class=${diff > 0 ? 'positive' : diff < 0 ? 'negative' : ''}
      ><b>(${diff > 0 ? '+' : ''}${diff.toFixed(2)})</b></span
    >`;
    return html`
      <h3>Chip counts</h3>
      <p class="description">
        This table shows how many chips all participants currently have.<br />Participants
        are ordered by the order in which they will make offers.
      </p>
      <div class="table">
        ${this.renderGlobalTableHeader()}
        <div class="table-body">
          ${participants
            .filter((p) => isActiveParticipant(p))
            .sort((a, b) => a.publicId.localeCompare(b.publicId))
            .map((p) => this.renderParticipantRow(p))}
        </div>
        <div class="table-foot">
          <div class="table-row">
            ${this.makeCell('Your starting payout')}
            ${Array(chipValues!.length - 1).fill(this.makeCell(''))}
            ${this.makeCell(`$${initialPayout!.toFixed(2)}`)}
          </div>

          <div class="table-row">
            ${this.makeCell('Your total payout')}
            ${Array(chipValues!.length - 1).fill(this.makeCell(''))}
            <div
              class="table-cell ${diff > 0
                ? 'positive'
                : diff < 0
                ? 'negative'
                : ''}"
            >
              $${totalPayout!.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chip-reveal-view': ChipReveal;
  }
}
