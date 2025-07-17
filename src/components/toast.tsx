import { CheckCircle, XCircle } from "lucide-react";

export interface ToastProps {
	message: string;
	type: "success" | "error";
	duration?: number;
	onClose: (id: string) => void;
}

export function Toast({ message, type }: ToastProps) {
	const baseClasses =
		"absolute top-[-10%] left-[20%] flex items-center gap-2 p-1 rounded-lg shadow-lg border transition-all duration-200 ease-in-out transform";
	const visibilityClasses = message ? "translate-y-0 opacity-100" : "translate-x-full opacity-0";

	const typeClasses = {
		success: "bg-green-50 border-green-200 text-green-800",
		error: "bg-red-50 border-red-200 text-red-800",
	};

	const iconClasses = {
		success: "text-green-600",
		error: "text-red-600",
	};

	return (
		<div className={`${baseClasses} ${visibilityClasses} ${typeClasses[type]}`}>
			{type === "success" ? (
				<CheckCircle className={`w-5 h-5 ${iconClasses[type]} flex-shrink-0`} />
			) : (
				<XCircle className={`w-5 h-5 ${iconClasses[type]} flex-shrink-0`} />
			)}

			<span className="text-sm font-medium flex-1">{message}</span>
		</div>
	);
}

