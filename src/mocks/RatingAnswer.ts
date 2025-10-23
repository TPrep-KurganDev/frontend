type Rating = {
  value: number;
  text: string;
  color: string;
}

type RatingAnswer = {
  title: string;
  rating: Rating[];
}

export const ratingAnswers: RatingAnswer = {
  title: 'Как вы оцениваете свой ответ?',
  rating: [
    {value: 1, text: 'Плохо', color: 'lightGray'},
    {value: 2, text: 'Не очень', color: 'lightYellow'},
    {value: 3, text: 'Нормально', color: 'yellow'},
    {value: 4, text: 'Хорошо', color: 'brightYellow'}
  ]
}
