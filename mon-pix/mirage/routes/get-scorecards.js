export default function(schema, request) {
  const userId = request.params.id;

  const area1 = schema.areas.find(1);
  const area2 = schema.areas.find(2);

  const scorecardN1 = schema.scorecards.create({
    name: 'Compétence C1',
    earnedPix: 3,
    level: 2,
    pixScoreAheadOfNextLevel: 3.2,
    area: area1
  });
  const scorecardN2 = schema.scorecards.create({
    name: 'Compétence C2',
    earnedPix: 7,
    level: 4,
    pixScoreAheadOfNextLevel: 7.2,
    area: area1
  });
  const scorecardN3 = schema.scorecards.create({
    name: 'Compétence C3',
    earnedPix: 10,
    level: 3,
    pixScoreAheadOfNextLevel: 5.36,
    area: area2
  });

  const user = schema.users.find(userId);
  user.update('scorecards', [scorecardN1, scorecardN2, scorecardN3]);

  return user.scorecards;

}
