import { DataEdge, DataNode, DataNodeMap, Intent, PayloadAccessor, PayloadFlow, PayloadFlowMap } from '@hami-frameworx/core'
import { EventEmitter } from 'node:events'

export class Payload extends EventEmitter {
  private nodes: DataNodeMap = {}
  private flows: PayloadFlowMap = {}

  constructor() {
    super()
    this.setMaxListeners(1000)
  }

  getNode(id: string): DataNode | undefined {
    return this.nodes[id]
  }

  getNodes(): DataNodeMap {
    return this.nodes
  }

  private addNode(node: DataNode): void {
    this.nodes[node.id] = node
    this.nNotify(node.id, 'created')
  }

  private updateNode(
    id: string,
    data: Partial<Record<string, unknown>>,
    meta: Partial<Record<string, unknown>>,
    edges: DataEdge[],
  ): void {
    const node = this.nodes[id]

    if (!node) {
      return
    }

    node.data = {
      ...node.data,
      ...data
    }

    node.meta = {
      ...node.meta,
      ...meta
    }

    node.edges = edges

    this.nNotify(id, 'updated')
  }

  private removeNode(id: string): void {
    if (!this.nodes[id]) {
      return
    }

    delete this.nodes[id]

    this.nNotify(id, 'removed')
  }

  addFlow(flow: PayloadFlow): void {
    this.flows[flow.id] = flow
    this.fNotify(flow.id, 'added')
  }

  removeFlow(id: string): void {
    delete this.flows[id]
    this.fNotify(id, 'removed')
  }

  async runFlow(
    intent: Intent,
    target?: string,
    options?: Record<string, unknown>
  ): Promise<void> {
    const accessor: PayloadAccessor = {
      getNode: (id) => this.getNode(id),
      getNodes: () => this.getNodes(),

      addNode: (node) => this.addNode(node),

      updateNode: (id, data, meta, edges) =>
        this.updateNode(id, data, meta, edges),

      removeNode: (id) =>
        this.removeNode(id),

      runFlow: (intent, target, options) =>
        this.runFlow(intent, target, options)
    }

    if (target) {
      const flow = this.flows[target]

      if (!flow) {
        return
      }

      await flow.execute(accessor, intent, options)

      return
    }

    for (const flow of Object.values(this.flows)) {
      if (!flow.supportedIntents.includes(intent.kind)) {
        continue
      }

      await flow.execute(accessor, intent, options)
    }
  }

  private nNotify(
    id: string,
    type: 'created' | 'updated' | 'removed'
  ): void {
    const node = this.nodes[id]

    this.emit(`node:${type}`, node ?? { id })

    if (type === 'updated' && node) {
      this.emit(`node:updated:${id}`, node)
    }
  }

  private fNotify(
    id: string,
    type: 'added' | 'removed'
  ): void {
    const flow = this.flows[id]

    this.emit(`flow:${type}`, id, flow)
  }
}
