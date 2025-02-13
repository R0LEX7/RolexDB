import { DoublyLinkedList, ListNode } from "./list";

let MAX_SIZE = 20;
const cacheMap = new Map<string, ListNode>();
const LRUList = new DoublyLinkedList();

const setDataIntoCache = (key: string, value: string): void => {
  if (cacheMap.has(key)) {
    let node = cacheMap.get(key) as ListNode;
    node.value = value;
    LRUList.moveToFront(node);
  } else {
    let node = new ListNode(key, value);
    cacheMap.set(key, node);
    LRUList.addToFront(node);

    if (cacheMap.size > MAX_SIZE) {
      let lruNode: ListNode | null = LRUList.removeTail();
      if (lruNode?.key) cacheMap.delete(lruNode.key);
    }
  }
};

const getDataFromCache = (key: string): string | null | undefined => {
  let node = cacheMap.get(key) as ListNode;
  if (!node) return null;

  LRUList.moveToFront(node);
  return node.value;
};
