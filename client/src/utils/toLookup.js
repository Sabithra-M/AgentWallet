export function toLookup(items, pick = (item) => item.name) {
  return items.reduce((map, item) => {
    map[item.id] = pick(item)
    return map
  }, {})
}
