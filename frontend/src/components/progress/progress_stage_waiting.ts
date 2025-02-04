import '../../pair-components/button';
import '../../pair-components/tooltip';
import '../participant_profile/profile_display';

import {MobxLitElement} from '@adobe/lit-mobx';
import {CSSResultGroup, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import {core} from '../../core/core';
import {CohortService} from '../../services/cohort.service';
import {ExperimentService} from '../../services/experiment.service';
import {ParticipantService} from '../../services/participant.service';
import {RouterService} from '../../services/router.service';

import {ParticipantProfile} from '@deliberation-lab/utils';
import {
  isActiveParticipant,
} from '../../shared/participant.utils';

import {styles} from './progress_stage_waiting.scss';

/** Display this component if a stage is in a waiting phase. */
@customElement('progress-stage-waiting')
export class Progress extends MobxLitElement {
  static override styles: CSSResultGroup = [styles];

  private readonly cohortService = core.getService(CohortService);
  private readonly experimentService = core.getService(ExperimentService);
  private readonly participantService = core.getService(ParticipantService);
  private readonly routerService = core.getService(RouterService);

  @property() showReadyAvatars = true;
  @property() showWaitingAvatars = false;

  @state() completeWaitingLoading = false;

  override render() {
    const stageId = this.routerService.activeRoute.params['stage'];
    const stage = this.experimentService.getStage(stageId);
    if (!stage) return nothing;

    const locked = this.cohortService.getLockedStageParticipants(stageId);
    const unlocked = this.cohortService.getUnlockedStageParticipants(stageId);

    const numWaiting =
      this.cohortService.getWaitingPhaseMinParticipants(stageId) - unlocked.length;

    const completeWaiting = async () => {
      this.completeWaitingLoading = true;

      await this.participantService.updateWaitingPhaseCompletion(stageId);

      this.completeWaitingLoading = false;
    };

    const renderWaitingStatus = () => {
      if (numWaiting === 0) return nothing;

      return html`
        <div class="status">
          <h2 class="secondary">
            <div class="chip secondary">Waiting on</div>
            <div>
              ${numWaiting}
              participant${numWaiting > 1 ? 's' : ''}
            </div>
          </h2>
          ${this.showWaitingAvatars ? this.renderParticipants(locked) : nothing}
        </div>
        <div class="divider"></div>
      `;
    };

    return html`
      ${renderWaitingStatus()}
      <div class="status">
        <h2 class="secondary">
          <div class="chip secondary">Ready</div>
          <div>${unlocked.length} participants</div>
        </h2>
        ${this.showReadyAvatars ? this.renderParticipants(unlocked) : nothing}
      </div>
      <div class="note">
        NOTE: If you have been waiting for a long time, please refresh to
        ensure your page is up to date!
      </div>
      <pr-button
        color=${numWaiting > 0 ? 'neutral' : 'primary'}
        ?disabled=${numWaiting > 0}
        ?loading=${this.completeWaitingLoading}
        @click=${completeWaiting}
      >
        ${numWaiting > 0 ? 'Waiting on participants...' : 'Continue to stage'}
      </pr-button>
    `;
  }

  private renderParticipant(participant: ParticipantProfile) {
    const isDisabled = !isActiveParticipant(participant);

    let tooltipText = '';
    if (isDisabled) {
      tooltipText = 'This participant is no longer in the experiment';
    }

    const stageId = this.routerService.activeRoute.params['stage'];

    return html`
      <pr-tooltip text=${tooltipText} position="BOTTOM_END">
        <participant-profile-display
          .profile=${participant}
          .stageId=${stageId}
          displayType="waiting">
        </participant-profile-display>
       </pr-tooltip>
    `;
  }

  private renderParticipants(participants: ParticipantProfile[]) {
    return html`
      <div class="participants-wrapper">
        ${participants.map((p) => this.renderParticipant(p))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'progress-stage-waiting': Progress;
  }
}
