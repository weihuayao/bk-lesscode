/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import http from '@/api'

const prefix = '/nocode'

export default {
    namespaced: true,
    state: {
        flowConfig: {}
    },
    mutations: {
        setFlowConfig (state, data) {
            state.flowConfig = Object.assign({}, state.flowConfig, data)
        },
        // 设置流程的节点表单映射表
        setFlowNodeFormId (state, data) {
            const formIds = state.flowConfig.formIds
            const { nodeId, formId } = data
            let idsMap = {}
            if (formIds) {
                idsMap = JSON.parse(formIds)
                idsMap[nodeId] = formId
            } else {
                idsMap = { [nodeId]: formId }
            }
            state.flowConfig.formIds = JSON.stringify(idsMap)
        },
        // 删除流程设置中节点对应的表单映射
        delFlowNodeFormId (state, nodeId) {
            const formIds = state.flowConfig.formIds
            debugger
            if (formIds) {
                const idsMap = JSON.parse(formIds)
                if (nodeId in idsMap) {
                    delete idsMap[nodeId]
                    state.flowConfig.formIds = JSON.stringify(idsMap)
                }
            }
        },
        clearFlowConfig (state) {
            state.flowConfig = {}
        }
    },
    getters: {
        flowNodeForms (state) {
            if (state.flowConfig.formIds) {
                return JSON.parse(state.flowConfig.formIds)
            }
            return {}
        }
    },
    actions: {
        // 获取项目下流程列表
        getFlowList ({ state }, params) {
            return http.get(`${prefix}/service`, { params }).then(response => response.data)
        },
        // 创建流程
        createFlow ({ state }, params) {
            return http.post(`${prefix}/service`, params).then(response => response.data)
        },
        // 编辑流程信息（恢复归档，更新名称、描述）
        editFlow ({ state }, params) {
            return http.put(`${prefix}/service`, params).then(response => response.data)
        },
        // 删除流程
        delFlow ({ state }, params) {
            return http.delete(`${prefix}/service`, { params }).then(response => response.data)
        },
        // 获取流程数据
        getFlowData ({ state }, params) {
            return http.get(`${prefix}/flow`, { params }).then(response => {
                return response.data
            })
        },
        // 获取流程详情数据，由流程服务返回流程的具体配置
        getServiceData ({ state }, id) {
            return http.get(`${prefix}/service/${id}/`).then(response => response.data)
        },
        // 更新流程服务配置
        updateServiceData ({ state }, params) {
            const { id, data } = params
            return http.post(`${prefix}/service/${id}/save_configs/`, data).then(response => response.data)
        },
        // 获取流程图节点
        getFlowNodes ({ state }, params) {
            return http.get(`${prefix}/state/`, { params }).then(response => response.data)
        },
        // 获取流程图连线
        getFlowLines ({ state }, params) {
            return http.get(`${prefix}/transition/`, { params }).then(response => response.data)
        },
        // 获取节点配置
        getNodeConfig ({ state }, id) {
            return http.get(`${prefix}/state/${id}`).then(response => response.data)
        },
        // 创建节点
        createNode ({ state }, params) {
            return http.post(`${prefix}/state/`, params).then(response => response.data)
        },
        // 更新节点数据
        updateNodePos ({ state }, params) {
            return http.patch(`${prefix}/state/${params.id}`, params.data).then(response => response.data)
        },
        // 批量保存表单字段到流程服务
        batchSaveFields ({ state }, params) {
            return http.post(`${prefix}/field/batch_save/`, params).then(response => response.data)
        },
        // 更新节点数据
        updateNode ({ state }, params) {
            return http.put(`${prefix}/state/${params.id}`, params).then(response => response.data)
        },
        // 更新lesscode存的节点数据信息
        editFlowNode ({ state }, params) {
            return http.put(`${prefix}/serviceNode`, params).then(response => response.data)
        },
        // 删除节点
        delNode ({ state }, id) {
            return http.delete(`${prefix}/state/${id}`).then(response => response.data)
        },
        // 创建连线
        createLine ({ state }, params) {
            return http.post(`${prefix}/transition/`, params).then(response => response.data)
        },
        // 更新线条
        updateLine ({ state }, params) {
            return http.put(`${prefix}/transition/${params.id}/`, params.data).then(response => response.data)
        },
        // 删除线条
        deleteLine ({ state }, id) {
            return http.delete(`${prefix}/transition/${id}/`).then(response => response.data)
        },
        // 获取线条可使用变量
        getLineVars ({ state }, id) {
            return http.get(`${prefix}/transition/${id}/variables/`).then(response => response.data)
        },
        // 获取节点变量列表
        getNodeVars ({ state }, params) {
            return http.get(`${prefix}/state/${params.state}/variables/`, { params }).then(response => response.data)
        },
        // 获取前置各节点的变量
        getGroupedNodeVars ({ state }, id) {
            return http.get(`${prefix}/state/${id}/group_variables/`).then(response => response.data)
        },
        // 获取某一节点的前置节点列表
        getPreNodes ({ state }, id) {
            return http.get(`${prefix}/state/${id}/pre_states/`).then(response => response.data)
        },
        // 获取流程中的审批节点
        getApprovalNode ({ state }, id) {
            return http.get(`${prefix}/state/${id}/get_approve_states/`).then(response => response.data)
        },
        // 获取审批节点提前结束条件变量
        getSignNodeConditions ({ state }, id) {
            return http.get(`${prefix}/state/${id}/sign_variables/`).then(response => response.data)
        },
        // 获取人员分组列表
        getRoleGroups ({ state }, params) {
            return http.get(`${prefix}/role_type/`, { params }).then(response => response.data)
        },
        // 获取组织架构数据
        getOrganizations () {
            return http.get(`${prefix}/gateway/usermanage/get_departments/`).then(response => response.data)
        },
        getFormList ({ state }, params) {
            return http.get('/nocode-form/list', { params }).then(response => response.data)
        },
        getAllUser () {
            return http.get(`${prefix}/getAllUser`).then(response => {
                const userData = response.data || []
                return userData
            })
        },
        getMember ({ state }, { projectId, name }) {
            return http.get(`${prefix}/getMember`, { params: { projectId, name } }).then(response => {
                const userData = response.data || []
                return userData
            })
        },

        addMembers ({ state }, data) {
            return http.post(`${prefix}/addMembers`, data).then(response => {
                const userData = response.data || []
                return userData
            })
        },

        editMember ({ state }, member) {
            return http.put(`${prefix}/editMember`, member).then(response => {
                const userData = response.data || []
                return userData
            })
        },

        deleteMember ({ state }, id) {
            return http.delete(`${prefix}/deleteMember?id=${id}`).then(response => {
                const userData = response.data || []
                return userData
            })
        },
             
        // 删除多个成员
        deleteMultipleMember ({ state }, ids) {
            return http.delete(`${prefix}/deleteMultipleMember?ids=${ids}`).then(response => {
                const userData = response.data || []
                return userData
            })
        },

        setCurUserPermInfo ({ commit }, project) {
            return http.post(`${prefix}/setCurUserPermInfo`, project).then(response => {
                const permInfo = response.data || {}
                commit('setUserPerm', permInfo)
            })
        }
    }
}