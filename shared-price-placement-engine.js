function validatePricePlacement(slides = []) {
  const priceSlide =
    slides.findIndex(
      slide =>
        /precio|costo|aportaci/i.test(
          slide.title || ""
        )
    );

  if (priceSlide === -1) {
    return {
      valid: true,
      reason: "PRICE_NOT_PRESENT"
    };
  }

  return {
    valid:
      priceSlide >= slides.length - 2,

    priceSlide
  };
}

module.exports = {
  validatePricePlacement
};
