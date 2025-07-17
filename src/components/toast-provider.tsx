import {createContext, PropsWithChildren, useCallback, useContext, useState} from "react";
import { Toast } from "@/components/toast.tsx";

export interface ToastContextProps {
	showToast: (message: string, type: "success" | "error", duration?: number) => void;
	removeToast: () => void;
	toastState: {
		id: string;
		message: string;
		type: "success" | "error";
		duration?: number;
	} | null;
}

export const ToastContext = createContext<ToastContextProps>({} as ToastContextProps);

export function ToastProvider({children}:PropsWithChildren) {
	const [toastState, setToastState] = useState<ToastContextProps["toastState"]>(null);

	const showToast = useCallback((message: string, type: "success" | "error") => {
		const id = Date.now().toString();
		setToastState({ id, message, type });

		setTimeout(() => {
			setToastState(null);
		}, 3000); // Default duration of 3 seconds
	}, []);

	const removeToast = useCallback(() => setToastState(null), []);

	return (
		<ToastContext.Provider value={{ showToast, removeToast, toastState }}>
			<div className="relative">
				{toastState && (
					<Toast
						key={toastState.id}
						message={toastState.message}
						type={toastState.type}
						onClose={removeToast}
					/>
				)}
				{children}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	return useContext(ToastContext);
}
