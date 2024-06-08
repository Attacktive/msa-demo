export const useFormatter = () => {
	const countFormatter = new Intl.NumberFormat("ko-KR", { style: "decimal" });
	const krwFormatter = new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" });

	const formatCount = (input: number) => countFormatter.format(input);
	const formatCurrency = (input: number) => krwFormatter.format(input);

	return {
		formatCount,
		formatCurrency
	};
};
