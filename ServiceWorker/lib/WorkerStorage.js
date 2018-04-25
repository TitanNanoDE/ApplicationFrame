import IndexedDB from '../../IndexedDB';

const { create } = Object;

const WorkerStorage = create(IndexedDB).constructor('sw_storage');

WorkerStorage.define(1)
    .store({ name: 'config', keyPath: 'key', unique: true })
    .index('key', 'key');

export default WorkerStorage;
