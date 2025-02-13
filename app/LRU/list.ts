export class ListNode {
  key : string |null;
  value : string |null;
  prev :ListNode | null;
  next :ListNode | null;
  constructor(key: string | null, value: string | null) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export class DoublyLinkedList {
    head : ListNode;
    tail : ListNode;
  constructor() {
    this.head = new ListNode(null, null);
    this.tail = new ListNode(null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  addToFront(node: ListNode) : void {
    node.next = this.head.next;
    node.prev = this.head;
    if (this.head.next) this.head.next.prev = node;
    this.head.next = node;
  }

  removeNode(node: ListNode) : void {
    if(node.next)node.next.prev = node.prev;
    if(node.prev)node.prev.next = node.next;
  }

  moveToFront(node: ListNode) : void {
    this.removeNode(node);
    this.addToFront(node);
  }

  removeLRUNode() : ListNode | null{
    if(this.tail.prev === this.head) return null;
    let node = this.tail.prev;
    if(node !== null) this.removeNode(node);
    return node
  }

  removeTail() : ListNode | null{

    if(this.tail.prev && this.tail.prev !== this.head){
        let node : ListNode = this.tail.prev as ListNode;
        let prvNode : ListNode = node.prev as ListNode
        if (prvNode) prvNode.next = this.tail;
        this.tail.prev = prvNode;
        return node;

    }else {
        this.tail.prev = this.head;
        this.head.next = this.tail
        return null;
    }
  }
}
