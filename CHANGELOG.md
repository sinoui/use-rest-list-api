# CHANGELOG

## v0.3.0 - 2019.7.9

- improve: 缓存回调函数
- breakchange: `setItem<T>(itemId: string, extraItemInfo: T): T`调整为`setItem<T>(itemId: string, extraItemInfo: Partial<T>)`，这个函数不再返回更新后的数据