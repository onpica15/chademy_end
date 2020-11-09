module.exports = {
  // 信用卡 - 轉換給前端的 key
  creditCardFormat: (creditCardRow) =>
    (creditCardRow || []).map((card) => {
      // 將字串用 '/' 切開來，變成陣列
      const [cardMonth, cardYear] = card.expiry_date.split('/')

      return {
        originCard: card,
        cardNumber: card.card_number,
        cardHolder: card.name,
        cardMonth: cardMonth,
        cardYear: cardYear,
        cardCvv: card.security_code,
      }
    }),
}
