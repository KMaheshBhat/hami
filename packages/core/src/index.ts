import packageJson from '../package.json' with { type: 'json' };
export const version = packageJson.version;

export interface DataEdge {
  toNodeId: string
  kind: string
  data: Record<string, unknown>
}

export interface DataNode<
  TData = Record<string, unknown>,
  TMeta = Record<string, unknown>
> {
  id: string
  kind: string
  data: TData
  edges: DataEdge[]
  meta: TMeta
}

export type DataNodeMap = Record<string, DataNode>

export interface DataNodeBuilder<
  TData = Record<string, unknown>,
  TMeta = Record<string, unknown>
> {
  withKind(kind: string): this
  withData(data: TData): this
  withEdge(edge: DataEdge): this
  withEdges(edges: DataEdge[]): this
  withMeta(meta: TMeta): this
  build(): DataNode<TData, TMeta>
}

export function createDataNode<
  TData = Record<string, unknown>,
  TMeta = Record<string, unknown>
>(id: string): DataNodeBuilder<TData, TMeta> {
  let kind = 'generic'
  let data = {} as TData
  let meta = {} as TMeta
  const edges: DataEdge[] = []

  const builder: DataNodeBuilder<TData, TMeta> = {
    withKind(k) {
      kind = k
      return this
    },

    withData(d) {
      data = d
      return this
    },

    withEdge(e) {
      edges.push(e)
      return this
    },

    withEdges(e) {
      edges.push(...e)
      return this
    },

    withMeta(m) {
      meta = m
      return this
    },

    build() {
      return {
        id,
        kind,
        data,
        edges,
        meta
      }
    }
  }

  return builder
}

export interface Intent<TOptions = Record<string, unknown>> {
  id: string
  kind: string
  nodes: DataNode[]
  options?: TOptions
}

export interface PayloadAccessor {
  getNode(id: string): DataNode | undefined
  getNodes(): DataNodeMap

  addNode(node: DataNode): void

  updateNode(
    id: string,
    data: Partial<Record<string, unknown>>,
    meta: Partial<Record<string, unknown>>,
    edges: DataEdge[],
  ): void

  removeNode(id: string): void

  runFlow(
    intent: Intent,
    target?: string,
    options?: Record<string, unknown>
  ): Promise<void>
}

export interface PayloadFlow {
  id: string
  kind: string

  supportedIntents: string[]

  execute(
    accessor: PayloadAccessor,
    intent: Intent,
    options?: Record<string, unknown>
  ): Promise<void>
}

export type PayloadFlowMap = Record<string, PayloadFlow>
