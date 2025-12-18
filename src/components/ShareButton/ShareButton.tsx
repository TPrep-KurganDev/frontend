const ShareButton = () => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Мой сайт',
          text: 'Посмотри, это полезно 👇',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Ошибка при шаринге', err);
      }
    } else {
      alert('Поделиться не поддерживается в этом браузере');
    }
  };

  return (
    <button onClick={handleShare}>
      Поделиться
    </button>
  );
};

export default ShareButton;
