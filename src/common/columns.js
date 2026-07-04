const userWcColumns = [
    {
        label: '序号',
        prop: 'index',
        width: 60,
    },
    {
        label: '抽取次数',
        prop: 'type',
        width: 100,
    },
    {
        label: '时间',
        prop: 'time',
        width: 170,
    },
    {
        label: '盒子名称',
        prop: 'name',
        width: 140,
    },
    {
        label: '抽取内容',
        prop: 'json',
        slot: true,
    },
]

export {
    userWcColumns
}