<template>
    <div class="table-cell-value">
        <span v-if="isValEmpty">--</span>
        <bk-button v-else-if="isOpenView" size="small" :text="true">查看</bk-button>
        <span v-else-if="isShowName">{{ transValToName( value[field.key]) }}</span>
        <bk-button v-else-if="field.type === 'FILE'" size="small" :text="true">下载</bk-button>
        <a v-else-if="field.type === 'LINK'" :href="value[field.key]" target="_blank">{{ value[field.key] }}</a>
        <div v-else-if="field.type === 'IMAGE'">
            <img v-for="(item, index) in value[field.key]" :src="item" :key="index">
        </div>
        <span v-else>{{ value[field.key] }}</span>
    </div>
</template>
<script>
    export default {
        name: 'tableCellValue',
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            value: [String, Number, Boolean, Array, Object]
        },
        computed: {
            isValEmpty () {
                return !(this.field.key in this.value)
                    || (['RICHTEXT', 'IMAGE', 'TABLE', 'FILE'].includes(this.field.type) && this.value[this.field.key].length === 0)
            },
            isOpenView () {
                return ['TABLE', 'RICHTEXT'].includes(this.field.type)
            },
            isShowName () {
                return ['SELECT', 'RADIO', 'CHECKBOX', 'INPUTSELECT', 'MULTISELECT'].includes(this.field.type)
            }
        },
        methods: {
            transValToName (val) {
                let name = ''
                if (['API', 'WORKSHEET'].includes(this.field.source_type)) {
                    name = val
                } else if (['CHECKBOX', 'MULTISELECT'].includes(this.field.type)) {
                    const tempArr = []
                    this.field.choice.forEach((item) => {
                        val.split(',').forEach((val) => {
                            if (item.key === val) {
                                tempArr.push(item.name)
                            }
                        })
                        name = tempArr.join(',')
                    })
                } else {
                    this.field.choice.forEach(item => {
                        if (item.key === val) {
                            name = item.name
                        }
                    })
                }
                return name || '--'
            }
        }
    }
</script>
<style lang="postcss" scoped>

</style>
