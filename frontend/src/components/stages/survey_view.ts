import '../../pair-components/textarea';

import './stage_description';
import './stage_footer';
import '@material/web/radio/radio.js';

import {MobxLitElement} from '@adobe/lit-mobx';
import {CSSResultGroup, html, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import {
  CheckSurveyAnswer,
  CheckSurveyQuestion,
  MultipleChoiceItem,
  MultipleChoiceSurveyAnswer,
  MultipleChoiceSurveyQuestion,
  SurveyQuestion,
  ScaleSurveyAnswer,
  ScaleSurveyQuestion,
  SurveyQuestionKind,
  SurveyAnswer,
  SurveyStageConfig,
  SurveyStageParticipantAnswer,
  TextSurveyQuestion,
} from '@deliberation-lab/utils';

import {core} from '../../core/core';
import {ParticipantService} from '../../services/participant.service';
import {SurveyService} from '../../services/survey.service';

import {styles} from './survey_view.scss';

/** Survey stage view for participants */
@customElement('survey-view')
export class SurveyView extends MobxLitElement {
  static override styles: CSSResultGroup = [styles];

  private readonly participantService = core.getService(ParticipantService);
  private readonly surveyService = core.getService(SurveyService);

  @property() stage: SurveyStageConfig | undefined = undefined;
  @property() answer: SurveyStageParticipantAnswer | undefined = undefined;

  connectedCallback() {
    super.connectedCallback();
    this.surveyService.updateForCurrentRoute();
  }

  override render() {
    if (!this.stage) {
      return nothing;
    }

    const questionsComplete = () => {
      const answerMap = this.answer?.answerMap;
      const answerList = answerMap ? Object.values(answerMap) : [];

      // Confirm all non-text questions are written to backend
      if (
        answerList.length <
        this.stage!.questions.length - this.surveyService.getNumTextAnswers()
      ) {
        return false;
      }
      // Confirm that all text answers are completed on frontend
      return this.surveyService.isAllTextAnswersValid();
    };

    const saveTextAnswers = async () => {
      await this.surveyService.saveTextAnswers();
    }

    return html`
      <stage-description .stage=${this.stage}></stage-description>
      <div class="questions-wrapper">
        ${this.stage.questions.map((question) => this.renderQuestion(question))}
      </div>
      <stage-footer
        .disabled=${!questionsComplete()}
        .onNextClick=${saveTextAnswers}
      >
      </stage-footer>
    `;
  }

  private renderQuestion(question: SurveyQuestion) {
    switch (question.kind) {
      case SurveyQuestionKind.CHECK:
        return this.renderCheckQuestion(question);
      case SurveyQuestionKind.MULTIPLE_CHOICE:
        return this.renderMultipleChoiceQuestion(question);
      case SurveyQuestionKind.SCALE:
        return this.renderScaleQuestion(question);
      case SurveyQuestionKind.TEXT:
        return this.renderTextQuestion(question);
      default:
        return nothing;
    }
  }

  private renderCheckQuestion(question: CheckSurveyQuestion) {
    const isChecked = () => {
      const answer = this.answer?.answerMap[question.id];
      if (answer && answer.kind === SurveyQuestionKind.CHECK) {
        return answer.isChecked;
      }
      return false;
    }

    const handleCheck = () => {
      const answer: CheckSurveyAnswer = {
        id: question.id,
        kind: SurveyQuestionKind.CHECK,
        isChecked: !isChecked(),
      };
      // Update stage answer
      if (!this.stage) return;
      this.participantService.updateSurveyStageParticipantAnswer(
        this.stage.id,
        answer
      );
    };

    return html`
      <div class="question">
        <label class="checkbox-wrapper">
          <md-checkbox
            touch-target="wrapper"
            aria-label=${question.questionTitle}
            ?checked=${isChecked()}
            ?disabled=${this.participantService.disableStage}
            @click=${handleCheck}
          >
          </md-checkbox>
          <div class="question-title">${question.questionTitle}</div>
        </label>
      </div>
    `;
  }

  private renderTextQuestion(question: TextSurveyQuestion) {
    const handleTextChange = (e: Event) => {
      const answerText = (e.target as HTMLInputElement).value ?? '';
      this.surveyService.updateTextAnswer(question.id, answerText);
    };

    return html`
      <div class="question">
        <div class="question-title">${question.questionTitle}</div>
        <pr-textarea
          variant="outlined"
          placeholder="Type your response"
          .value=${this.surveyService.getTextAnswer(question.id) ?? ''}
          ?disabled=${this.participantService.disableStage}
          @change=${handleTextChange}
        >
        </pr-textarea>
      </div>
    `;
  }

  private renderMultipleChoiceQuestion(question: MultipleChoiceSurveyQuestion) {
    return html`
      <div class="radio-question">
        <div class="title">${question.questionTitle}</div>
        ${question.options.map((option) =>
          this.renderRadioButton(option, question.id)
        )}
      </div>
    `;
  }

  private isMultipleChoiceMatch(questionId: string, choiceId: string) {
    const answer = this.answer?.answerMap[questionId];
    if (answer && answer.kind === SurveyQuestionKind.MULTIPLE_CHOICE) {
      return answer.choiceId === choiceId;
    }
    return false;
  }

  private renderRadioButton(choice: MultipleChoiceItem, questionId: string) {
    const id = `${questionId}-${choice.id}`;

    const handleMultipleChoiceClick = (e: Event) => {
      const answer: MultipleChoiceSurveyAnswer = {
        id: questionId,
        kind: SurveyQuestionKind.MULTIPLE_CHOICE,
        choiceId: choice.id,
      };
      // Update stage answer
      if (!this.stage) return;
      this.participantService.updateSurveyStageParticipantAnswer(
        this.stage.id,
        answer
      );
    };

    return html`
      <div class="radio-button">
        <md-radio
          id=${id}
          name=${questionId}
          value=${choice.id}
          aria-label=${choice.text}
          ?checked=${this.isMultipleChoiceMatch(questionId, choice.id)}
          ?disabled=${this.participantService.disableStage}
          @change=${handleMultipleChoiceClick}
        >
        </md-radio>
        <label for=${id}>${choice.text}</label>
      </div>
    `;
  }

  private renderScaleQuestion(question: ScaleSurveyQuestion) {
    const scale = [...Array(question.upperValue + 1).keys()].slice(question.lowerValue);
    return html`
      <div class="question">
        <div class="question-title">${question.questionTitle}</div>
        <div class="scale labels">
          <div>${question.lowerText}</div>
          <div>${question.upperText}</div>
        </div>  
        <div class="scale values">
          ${scale.map((num) => this.renderScaleRadioButton(question, num))}
        </div>
      </div>
    `;
  }

  private renderScaleRadioButton(question: ScaleSurveyQuestion, value: number) {
    const name = `${question.id}`;
    const id = `${question.id}-${value}`;

    const isScaleChoiceMatch = (value: number) => {
      const answer = this.answer?.answerMap[question.id];
      if (answer && answer.kind === SurveyQuestionKind.SCALE) {
        return answer.value === value;
      }
      return false;
    };

    const handleScaleClick = (e: Event) => {
      const value = Number((e.target as HTMLInputElement).value);
      const answer: ScaleSurveyAnswer = {
        id: question.id,
        kind: SurveyQuestionKind.SCALE,
        value,
      };

      // Update stage answer
      if (!this.stage) return;
      this.participantService.updateSurveyStageParticipantAnswer(
        this.stage.id,
        answer
      );
    };

    return html`
      <div class="scale-button">
        <md-radio
          id=${id}
          name=${name}
          value=${value}
          aria-label=${value}
          ?checked=${isScaleChoiceMatch(value)}
          ?disabled=${this.participantService.disableStage}
          @change=${handleScaleClick}
        >
        </md-radio>
        <label for=${id}>${value}</label>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'survey-view': SurveyView;
  }
}
