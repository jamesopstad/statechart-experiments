import { useCallback, useEffect, useReducer, useTransition } from "react";
import { clearActionQueue } from "./createMachine";
import type { Machine } from "./createMachine";

export function useMachine<T>(machine: Machine<T>) {
	const [{ state, actionQueue, invoker }, dispatch] = useReducer(
		machine.transition,
		machine.initialState
	);

	const [isPending, startTransition] = useTransition();

	const send = useCallback(
		(event: Parameters<typeof dispatch>[0]) => {
			startTransition(() => {
				dispatch(event);
			});
		},
		[dispatch]
	);

	useEffect(() => {
		if (actionQueue.length) {
			actionQueue.forEach((action) => action());
			send(clearActionQueue());
		}
	}, [actionQueue, send]);

	useEffect(() => {
		return invoker?.({ send });
	}, [invoker]);

	return { state, send, isPending } as const;
}
