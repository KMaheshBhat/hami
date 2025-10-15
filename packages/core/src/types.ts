import { Node } from "pocketflow"

export class HAMINode<S = unknown> extends Node<S> {
    kind(): string {
        return "hami-node";
    }
}