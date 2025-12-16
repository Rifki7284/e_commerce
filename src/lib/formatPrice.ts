const formatPrice = (price: number): string => {
    if (isNaN(price)) return "Rp0";
    const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
    return formatted.replace(/\s+/g, "");
};
export default formatPrice
