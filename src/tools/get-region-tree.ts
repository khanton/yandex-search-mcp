import { callWordstat } from "../client.js";

interface RegionNode {
  id: string;
  label: string;
  children?: RegionNode[];
}

type GetRegionTreeResponse = RegionNode[];

function flattenTree(nodes: RegionNode[], depth = 0): string[] {
  const lines: string[] = [];
  for (const node of nodes) {
    lines.push(`${"  ".repeat(depth)}${node.label} (id: ${node.id})`);
    if (node.children?.length) {
      lines.push(...flattenTree(node.children, depth + 1));
    }
  }
  return lines;
}

export async function getRegionTree(): Promise<string> {
  const data = await callWordstat<GetRegionTreeResponse>(
    "getRegionsTree",
    {}
  );

  if (!data?.length) return "Список регионов пуст.";

  const lines = ["Дерево регионов Яндекса:", "", ...flattenTree(data)];
  return lines.join("\n");
}
