<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->
<template>
    <section class="flow-edit-wrapper">
        <div class="page-header-container">
            <div class="nav-container">
                <back-btn></back-btn>
                <flow-selector
                    :list="flowList"
                    :list-loading="listLoading"
                    :flow-config="flowConfig">
                </flow-selector>
            </div>
            <div class="steps-container">
                <bk-steps
                    v-if="!serviceDataLoading"
                    :steps="steps"
                    :cur-step="curStep"
                    @step-changed="handleStepChange">
                </bk-steps>
            </div>
            <div class="genarate-action">
                <generate-data-manage-page v-if="!flowConfigLoading"></generate-data-manage-page>
            </div>
        </div>
        <div v-if="!serviceDataLoading" class="flow-edit-main">
            <router-view
                :flow-config="flowConfig"
                :service-data="serviceData">
            </router-view>
        </div>
    </section>
</template>
<script>
    import { mapState } from 'vuex'
    import { messageError } from '@/common/bkmagic'
    import BackBtn from './components/back-btn.vue'
    import FlowSelector from './components/flow-selector.vue'
    import GenerateDataManagePage from './components/generate-data-manage-page.vue'

    const STEPS = [
        { id: 'flowDesign', icon: 1, title: '流程设计' },
        { id: 'flowConfig', icon: 2, title: '流程设置' }
    ]

    export default {
        name: 'flowEdit',
        components: {
            BackBtn,
            FlowSelector,
            GenerateDataManagePage
        },
        data () {
            return {
                steps: STEPS,
                curStep: this.getCurStep(),
                flowId: this.$route.params.flowId,
                listLoading: true,
                flowList: [],
                flowConfigLoading: true,
                serviceDataLoading: true,
                serviceData: {}
            }
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig']),
            projectId () {
                return this.$route.params.projectId
            }
        },
        watch: {
            '$route.name' () {
                this.curStep = this.getCurStep()
            },
            '$route.params.flowId' (val) {
                this.flowId = val
                this.getflowConfig()
            }
        },
        async created () {
            this.getFlowList()
            await this.getflowConfig()
            this.getServiceData()
        },
        beforeDestroy () {
            this.$store.commit('nocode/flow/clearFlowConfig')
        },
        methods: {
            async getFlowList () {
                this.listLoading = true
                try {
                    const res = await this.$store.dispatch('nocode/flow/getFlowList', {
                        projectId: this.projectId
                    })
                    this.flowList = res.list
                } catch (err) {
                    messageError(err.message || err)
                } finally {
                    this.listLoading = false
                }
            },
            async getflowConfig () {
                try {
                    this.flowConfigLoading = true
                    const res = await this.$store.dispatch('nocode/flow/getFlowData', { id: this.flowId })
                    this.$store.commit('nocode/flow/setFlowConfig', res)
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.flowConfigLoading = false
                }
            },
            // 保存到流程服务的配置
            async getServiceData () {
                try {
                    this.serviceDataLoading = true
                    this.serviceData = await this.$store.dispatch('nocode/flow/getServiceData', this.flowConfig.itsmId)
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.serviceDataLoading = false
                }
            },
            getCurStep () {
                return this.$route.name === 'flowConfig' ? 1 : 2
            },
            handleStepChange (val) {
                if (val === 1) {
                    this.$router.push({ name: 'flowConfig' })
                } else {
                    this.$router.push({ name: 'flowAdvancedConfig' })
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
.flow-edit-wrapper {
    height: 100%;
}
.page-header-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 52px;
    background: #ffffff;
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.04);
    .nav-container {
        position: absolute;
        top: 10px;
        left: 35px;
        display: flex;
        align-items: center;
        .go-back-icon-wrapper {
            margin-right: 10px;
        }
    }
    .steps-container {
        min-width: 360px;
    }
    .genarate-action {
        position: absolute;
        top: 14px;
        right: 24px;
    }
}
.flow-edit-main {
    height: calc(100% - 53px);
}
</style>
