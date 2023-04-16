import { useCallback, useEffect, useReducer, useTransition } from "react";
import type { EventObject, Machine } from "./createMachine";

export function useMachine<T>(machine: Machine<T>) {
	const [[state, invoke], dispatch] = useReducer(
		machine.transition,
		machine.initialState
	);

	const [isPending, startTransition] = useTransition();

	const send = useCallback(
		(event: EventObject) => {
			startTransition(() => {
				dispatch(event);
			});
		},
		[dispatch]
	);

	useEffect(() => {
		return invoke?.({ send });
	});

	return { state, send, isPending } as const;
}
