import { AxiosError } from "axios";

export const useErrorHelper = () => {
	const getErrorMessage = (error: unknown) => {
		let message: string;
		if (error instanceof AxiosError && error.response?.data.message) {
			message = error.response.data.message;
		} else if (error instanceof Error) {
			message = error.message;
		} else {
			if (error) {
				message = error.constructor.name;
			} else {
				message = "";
			}
		}

		return message;
	};

	return { getErrorMessage };
};
