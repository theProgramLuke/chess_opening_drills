import { Graph } from "graphlib";

interface NodeData {
  foo: number;
  bar: string;
}

interface EdgeData {
  baz?: string;
}

describe("Graph", () => {
  it("should allow typed nodes", () => {
    const graph = new Graph<NodeData, EdgeData>();
    const nodeData = { foo: 17, bar: "some string" };
    const name = "a";

    graph.setNode(name, nodeData);
    const actual = graph.node(name);

    expect(actual).toBe(nodeData);
  });

  it("should allow typed edges", () => {
    const graph = new Graph<NodeData, EdgeData>();
    const edgeData = { baz: "some string" };
    graph.setNode("a");
    graph.setNode("b");

    graph.setEdge("a", "b", edgeData);
    const actual = graph.edge("a", "b");

    expect(actual).toBe(edgeData);
  });
});
