import { memo } from "react";

export const SlowComponent = memo(() => {
	let items = [];

	for (let i = 0; i < 500; i++) {
		items.push(<SlowItem key={i} index={i} />);
	}

	return <ul>{items}</ul>;
});

function SlowItem({ index }: { index: number }) {
	let startTime = performance.now();

	while (performance.now() - startTime < 1) {
		// do nothing
	}

	return <li>Item #{index + 1}</li>;
}
