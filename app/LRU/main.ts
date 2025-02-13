import { IMap } from "../Interfaces/parser";
import { DoublyLinkedList, ListNode } from "./list";

let MAX_SIZE = 2;
const cacheMap = new Map<string, ListNode>();
const LRUList = new DoublyLinkedList();

export const setDataIntoCache = (key: string, value: string | IMap): void => {
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
  console.log("cached map -> ", cacheMap);
};

export const getDataFromCache = ( key: string): string | null | undefined | IMap => {
  console.log("cached map -> ", cacheMap);
  let node = cacheMap.get(key) as ListNode;
  if (!node) {
    return null;
  }

  LRUList.moveToFront(node);
  return node.value;
};

export const deleteFromCache = (key: string): void => {
  let node = cacheMap.get(key);
  cacheMap.delete(key);
  if (node) LRUList.removeNode(node);
};
