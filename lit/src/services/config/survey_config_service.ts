import { computed, get, observable, makeObservable, toJS } from "mobx";

import { Service } from "../service";

import {
  SurveyStageConfig,
  SurveyQuestionKind,
  QuestionConfig
} from "@llm-mediation-experiments/utils";

/** Manages metadata for survey stage config. */
export class SurveyConfigService extends Service {
  constructor() {
    super();
    makeObservable(this);
  }

  @observable stage: SurveyStageConfig|null = null;

  @computed get name() {
    return this.stage?.name;
  }

  @computed get questions() {
    return this.stage?.questions ?? [];
  }

  updateName(name: string) {
    if (this.stage) {
      this.stage.name = name;
    }
  }

  addScaleQuestion(
    questionText = "Question", lowerBound = "0/10", upperBound = "10/10"
  ) {
    if (this.stage) {
      this.stage.questions.push({
        kind: SurveyQuestionKind.Scale,
        id: this.stage.questions.length,
        questionText,
        upperBound,
        lowerBound
      })
    }
  }

  updateScaleQuestion(index: number, question: QuestionConfig) {
    if (this.stage) {
      this.stage.questions = [
        ...this.stage.questions.slice(0, index),
        question,
        ...this.stage.questions.slice(index + 1)
      ];
    }
  }

  reset() {
    this.stage = null;
  }
}