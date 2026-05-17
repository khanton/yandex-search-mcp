import { callWordstat } from "../client.js";
function flattenTree(nodes, depth = 0) {
    const lines = [];
    for (const node of nodes) {
        lines.push(`${"  ".repeat(depth)}${node.label} (id: ${node.id})`);
        if (node.children?.length) {
            lines.push(...flattenTree(node.children, depth + 1));
        }
    }
    return lines;
}
export async function getRegionTree() {
    const data = await callWordstat("getRegionsTree", {});
    if (!data?.length)
        return "Список регионов пуст.";
    const lines = ["Дерево регионов Яндекса:", "", ...flattenTree(data)];
    return lines.join("\n");
}
