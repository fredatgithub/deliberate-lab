import {Type, type Static} from '@sinclair/typebox';
import {StageKind} from './stage';
import {
  StageGameSchema,
  StageProgressConfigSchema,
  StageTextConfigSchema,
} from './stage.validation';
import {RankingItem, ElectionStrategy, RankingType} from './ranking_stage';

/** Shorthand for strict TypeBox object validation */
const strict = {additionalProperties: false} as const;

// ************************************************************************* //
// writeExperiment, updateStageConfig endpoints                              //
// ************************************************************************* //

/** RankingItem input validation. */
export const RankingItemData = Type.Object(
  {
    id: Type.String({minLength: 1}),
    imageId: Type.String(),
    text: Type.String(),
  },
  strict,
);

/** RankingStageConfig input validation. */
export const ItemRankingStageConfigData = Type.Object(
  {
    id: Type.String({minLength: 1}),
    kind: Type.Literal(StageKind.RANKING),
    game: StageGameSchema,
    name: Type.String({minLength: 1}),
    descriptions: StageTextConfigSchema,
    progress: StageProgressConfigSchema,
    rankingType: Type.Literal(RankingType.ITEMS),
    strategy: Type.Union([
      Type.Literal(ElectionStrategy.NONE),
      Type.Literal(ElectionStrategy.CONDORCET),
    ]),
    rankingItems: Type.Array(RankingItemData),
  },
  strict,
);

export const ParticipantRankingStageConfigData = Type.Object(
  {
    id: Type.String({minLength: 1}),
    kind: Type.Literal(StageKind.RANKING),
    game: StageGameSchema,
    name: Type.String({minLength: 1}),
    descriptions: StageTextConfigSchema,
    progress: StageProgressConfigSchema,
    rankingType: Type.Literal(RankingType.PARTICIPANTS),
    strategy: Type.Union([
      Type.Literal(ElectionStrategy.NONE),
      Type.Literal(ElectionStrategy.CONDORCET),
    ]),
    enableSelfVoting: Type.Boolean(),
  },
  strict,
);

export const RankingStageConfigData = Type.Union([
  ItemRankingStageConfigData,
  ParticipantRankingStageConfigData,
]);

// ************************************************************************* //
// updateRankingStageParticipantAnswer endpoint                              //
// ************************************************************************* //

/** RankingStageParticipantAnswer input validation. */
export const RankingStageParticipantAnswerData = Type.Object(
  {
    id: Type.String({minLength: 1}),
    kind: Type.Literal(StageKind.RANKING),
    rankingList: Type.Array(Type.String()),
  },
  strict,
);

export const UpdateRankingStageParticipantAnswerData = Type.Object(
  {
    experimentId: Type.String({minLength: 1}),
    cohortId: Type.String({minLength: 1}),
    participantPublicId: Type.String({minLength: 1}),
    participantPrivateId: Type.String({minLength: 1}),
    stageId: Type.String({minLength: 1}),
    rankingList: Type.Array(Type.String()),
  },
  strict,
);

export type UpdateRankingStageParticipantAnswerData = Static<
  typeof UpdateRankingStageParticipantAnswerData
>;
