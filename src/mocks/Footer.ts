type Footer = {
  mistakesCount: number;
  cardsCount: number;
  doneCardsCount: number;
  cardsProgress: boolean[];
}

export const footer: Footer = {
  mistakesCount: 1,
  cardsCount: 12,
  doneCardsCount: 4,
  cardsProgress: [true, false, true, true]
}
