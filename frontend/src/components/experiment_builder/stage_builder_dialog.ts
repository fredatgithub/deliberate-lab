import '../../pair-components/icon_button';

import {MobxLitElement} from '@adobe/lit-mobx';
import {CSSResultGroup, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';

import {core} from '../../core/core';
import {AuthService} from '../../services/auth.service';
import {HomeService} from '../../services/home.service';
import {Pages, RouterService} from '../../services/router.service';

import {ExperimentEditor} from '../../services/experiment.editor';

import {
  StageKind,
  createChatStage,
  createElectionStage,
  createInfoStage,
  createProfileStage,
  createRevealStage,
  createSurveyStage,
  createTOSStage,
  createTransferStage
} from '@deliberation-lab/utils';
import {
  LAS_METADATA,
  getLASStageConfigs,
} from '../../shared/games/lost_at_sea';

import {styles} from './stage_builder_dialog.scss';

/** Stage builder dialog */
@customElement('stage-builder-dialog')
export class StageBuilderDialog extends MobxLitElement {
  static override styles: CSSResultGroup = [styles];

  private readonly experimentEditor = core.getService(ExperimentEditor);

  @state() showGames = false;

  override render() {
    return html`
      <div class="dialog">
        <div class="header">
          ${this.renderTabs()}
          <pr-icon-button
            color="neutral"
            icon="close"
            variant="default"
            @click=${() => { this.experimentEditor.toggleStageBuilderDialog(); }}
          >
          </pr-icon-button>
        </div>
        <div class="body">
          ${this.showGames ? this.renderGameCards() : this.renderStageCards()}
        </div>
      </div>
    `;
  }

  private renderTabs() {
    const getClasses = (selected: boolean) => {
      return classMap({
        'tab': true,
        'selected': selected,
      });
    };

    const toggleView = (showGames: boolean) => {
      this.showGames = showGames;
    }

    return html`
      <div class="tabs">
        <div class=${getClasses(!this.showGames)} @click=${() => {toggleView(false)}}>
          Add stages
        </div>
        <div class=${getClasses(this.showGames)} @click=${() => {toggleView(true)}}>
          Add game
        </div>
      </div>
    `;
  }

  private renderGameCards() {
    return html`
      <div class="banner error">
        ⚠️ Adding a game will override any current stages in your configuration
      </div>
      <div class="card-gallery-wrapper">
        ${this.renderLASCard()}
      </div>
    `;
  }

  private renderStageCards() {
    return html`
      <div class="card-gallery-wrapper">
        ${this.renderTOSCard()}
        ${this.renderInfoCard()}
        ${this.renderTransferCard()}
        ${this.renderProfileCard()}
        ${this.renderSurveyCard()}
        ${this.renderChatCard()}
        ${this.renderElectionCard()}
        ${this.renderRevealCard()}
      </div>
    `;
  }

  private renderLASCard() {
    const addGame = () => {
      this.experimentEditor.updateMetadata(LAS_METADATA);
      this.experimentEditor.setStages(getLASStageConfigs());
      this.experimentEditor.toggleStageBuilderDialog();
    };

    return html`
      <div class="card" @click=${addGame}>
        <div class="title">🌊 Lost at Sea</div>
        <div>
          After individually ranking survival items and discussing
          in group chat, elect a leader
          who will rank a new set of survival items
        </div>
      </div>
    `;
  }

  private renderInfoCard() {
    const addStage = () => {
      this.experimentEditor.addStage(createInfoStage());
      this.experimentEditor.toggleStageBuilderDialog();
      this.experimentEditor.jumpToLastStage();
    };

    return html`
      <div class="card" @click=${addStage}>
        <div class="title">Info</div>
        <div>
          Shows Markdown-rendered information
        </div>
      </div>
    `;
  }

  private renderTOSCard() {
    if (this.experimentEditor.hasStageKind(StageKind.TOS)) {
      return nothing;
    }

    const addStage = () => {
      this.experimentEditor.addStage(createTOSStage());
      this.experimentEditor.toggleStageBuilderDialog();
      this.experimentEditor.jumpToLastStage();
    };

    return html`
      <div class="card" @click=${addStage}>
        <div class="title">Terms of Service</div>
        <div>
          Shows Markdown-rendered terms of service to accept
        </div>
      </div>
    `;
  }

  private renderChatCard() {
    const addStage = () => {
      this.experimentEditor.addStage(createChatStage());
      this.experimentEditor.toggleStageBuilderDialog();
      this.experimentEditor.jumpToLastStage();
    };

    return html`
      <div class="card" @click=${addStage}>
        <div class="title">Group chat</div>
        <div>
          Discuss topics with other participants and LLM mediators
        </div>
      </div>
    `;
  }

  private renderElectionCard() {
    const addStage = () => {
      this.experimentEditor.addStage(createElectionStage());
      this.experimentEditor.toggleStageBuilderDialog();
      this.experimentEditor.jumpToLastStage();
    };

    return html`
      <div class="card" @click=${addStage}>
        <div class="title">Election</div>
        <div>
          Rank other participants in order to select a winner
        </div>
      </div>
    `;
  }

  private renderRevealCard() {
    const addStage = () => {
      this.experimentEditor.addStage(createRevealStage());
      this.experimentEditor.toggleStageBuilderDialog();
      this.experimentEditor.jumpToLastStage();
    };

    return html`
      <div class="card" @click=${addStage}>
        <div class="title">Reveal</div>
        <div>
          Show results for election stages, survey stages (multiple choice only)
        </div>
      </div>
    `;
  }

  private renderSurveyCard() {
    const addStage = () => {
      this.experimentEditor.addStage(createSurveyStage());
      this.experimentEditor.toggleStageBuilderDialog();
      this.experimentEditor.jumpToLastStage();
    };

    return html`
      <div class="card" @click=${addStage}>
        <div class="title">Survey</div>
        <div>
          Answer freeform, multiple choice, checkbox, and scale questions
        </div>
      </div>
    `;
  }

  private renderProfileCard() {
    const addStage = () => {
      this.experimentEditor.addStage(createProfileStage());
      this.experimentEditor.toggleStageBuilderDialog();
      this.experimentEditor.jumpToLastStage();
    };

    return html`
      <div class="card" @click=${addStage}>
        <div class="title">Profile</div>
        <div>
          Set participant profile
        </div>
      </div>
    `;
  }

  private renderTransferCard() {
    const addStage = () => {
      this.experimentEditor.addStage(createTransferStage());
      this.experimentEditor.toggleStageBuilderDialog();
      this.experimentEditor.jumpToLastStage();
    }

    return html`
      <div class="card" @click=${addStage}>
        <div class="title">Transfer</div>
        <div>
          During transfer stage, assign participants to different cohorts
          in your experiment while participants wait
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'stage-builder-dialog': StageBuilderDialog;
  }
}
