/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import {
    LCDataService,
    TABLE_FILE_NAME
} from '../service/data-service'
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    BodyParams,
    QueryParams,
    DeleteAuthorization,
    ProjectAuthorization,
    OutputJson
} from '../decorator'
import {
    PERM_CODE
} from '../../shared/perm/constant.js'
import { METHODS_WITHOUT_DATA } from '../../shared/api'
import http from '../utils/http/index'

@Controller('/api/api-manage')
export default class ApiManageController {
    // 获取分类列表
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.query.projectId })
    @Get('/category')
    async getCategoryList (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'versionId' }) versionId
    ) {
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.API_CATEGORY,
            query: {
                projectId,
                versionId
            },
            order: {
                order: 'ASC'
            }
        })
        return list
    }

    // 创建分类
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId })
    @Post('/category')
    async createCategory (
        @BodyParams({ name: 'projectId', require: true }) projectId,
        @BodyParams({ name: 'categoryName', require: true }) categoryName,
        @BodyParams({ name: 'versionId' }) versionId
    ) {
        const {
            list: categoryList
        } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.API_CATEGORY,
            query: {
                versionId,
                projectId,
                deleteFlag: 0
            }
        })
        const categoryNameList = categoryName.split('/')
        // 重复检查
        const repeatCategory = categoryList.find(category => categoryNameList.includes(category.name))
        if (repeatCategory) {
            throw new Error(`分类【${repeatCategory.name}】已存在，请修改后再试`)
        }
        // 新增分类
        let order = categoryList[categoryList.length - 1]?.order || 0
        const newCategoryList = categoryNameList.map((name) => ({
            versionId,
            projectId,
            name,
            order: ++order
        }))
        return LCDataService.bulkAdd(TABLE_FILE_NAME.API_CATEGORY, newCategoryList)
    }

    // 编辑分类
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId })
    @Put('/category')
    editFunctionGroups (
        @BodyParams({ name: 'categorys', require: true }) categorys
    ) {
        return LCDataService.bulkUpdate(TABLE_FILE_NAME.API_CATEGORY, categorys)
    }

    // 删除分类
    @OutputJson()
    @DeleteAuthorization({
        perm: PERM_CODE.DELETE_FUNC_GROUP,
        tableName: TABLE_FILE_NAME.API_CATEGORY,
        getId: ctx => ctx.request.query.id
    })
    @Delete('/category')
    async deleteCategory (
        @QueryParams({ name: 'id', require: true }) id
    ) {
        // 判断分类下已存在 Api
        const isExistApi = await LCDataService.has(TABLE_FILE_NAME.API, {
            categoryId: id,
            deleteFlag: 0
        })
        if (isExistApi) {
            throw new Error(`分组【ID：${id}】下已存在 Api，无法删除，请修改后再试`)
        }
        // 判断项目下是否只有一个分类
        const category = await LCDataService.findOne(TABLE_FILE_NAME.API_CATEGORY, {
            id
        })
        const count = await LCDataService.count(TABLE_FILE_NAME.API_CATEGORY, {
            projectId: category.projectId,
            deleteFlag: 0
        })
        if (count <= 1) {
            throw new Error(`项目【ID：${category.projectId}】下只有唯一一个分组，无法删除最后一个分组，请修改后再试`)
        }
        return LCDataService.delete(TABLE_FILE_NAME.API_CATEGORY, id)
    }

    // 获取项目下的api
    @OutputJson()
    @Get('/api')
    async getTableList (
        @QueryParams({ name: 'projectId', require: true }) projectId,
        @QueryParams({ name: 'categoryId' }) categoryId,
        @QueryParams({ name: 'versionId' }) versionId
    ) {
        const query = {
            versionId,
            projectId,
            deleteFlag: 0
        }
        if (categoryId !== undefined) {
            query.categoryId = categoryId
        }
        const { list } = await LCDataService.get({
            tableFileName: TABLE_FILE_NAME.API,
            query
        })
        return list
    }

    // 创建 api
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId })
    @Post('/api')
    async createApi (
        @BodyParams() form
    ) {
        const hasSameCode = await LCDataService.has(TABLE_FILE_NAME.API, {
            projectId: form.projectId,
            versionId: form.versionId,
            code: form.code,
            deleteFlag: 0
        })
        if (hasSameCode) {
            throw new Error(`应用[ID: ${form.projectId}]下，已存在同样标识（${form.code}）的Api，请修改后再试`)
        }
        const hasSameName = await LCDataService.has(TABLE_FILE_NAME.API, {
            projectId: form.projectId,
            versionId: form.versionId,
            name: form.name,
            deleteFlag: 0
        })
        if (hasSameName) {
            throw new Error(`应用[ID: ${form.projectId}]下，已存在同样名称（${form.name}）的Api，请修改后再试`)
        }
        return LCDataService.add(TABLE_FILE_NAME.API, form)
    }

    // 编辑 api
    @OutputJson()
    @ProjectAuthorization({ getId: ctx => ctx.request.body.projectId })
    @Put('/api')
    async editApi (
        @BodyParams() form
    ) {
        const sameCodeApi = await LCDataService.findOne(TABLE_FILE_NAME.API, {
            projectId: form.projectId,
            versionId: form.versionId,
            code: form.code,
            deleteFlag: 0
        })
        if (sameCodeApi && sameCodeApi.id !== form.id) {
            throw new Error(`应用[ID: ${form.projectId}]下，已存在同样标识（${form.code}）的Api，请修改后再试`)
        }
        const sameNameApi = await LCDataService.findOne(TABLE_FILE_NAME.API, {
            projectId: form.projectId,
            versionId: form.versionId,
            name: form.name,
            deleteFlag: 0
        })
        if (sameNameApi && sameNameApi.id !== form.id) {
            throw new Error(`应用[ID: ${form.projectId}]下，已存在同样名称（${form.name}）的Api，请修改后再试`)
        }
        return LCDataService.update(TABLE_FILE_NAME.API, form)
    }

    // 删除 api
    @OutputJson()
    @DeleteAuthorization({
        perm: PERM_CODE.DELETE_FUNC,
        tableName: TABLE_FILE_NAME.API,
        getId: ctx => ctx.request.query.id
    })
    @Delete('/api')
    deleteApi (
        @QueryParams({ name: 'id', require: true }) id
    ) {
        return LCDataService.delete(TABLE_FILE_NAME.API, id)
    }

    // 执行 api
    @OutputJson()
    @Post('/execute')
    async executeApi (
        @QueryParams({ name: 'id' }) id,
        @QueryParams() query,
        @BodyParams() body
    ) {
        const apiData = await LCDataService.findOne(TABLE_FILE_NAME.API, {
            id
        })
        if (!apiData) {
            throw global.BusinessError(`API [ID: ${id}]不存在，请修改后再试`, 404, 404)
        }
        const httpMethod = apiData.method
        const httpParams = [apiData.url]
        if (METHODS_WITHOUT_DATA.includes(httpMethod)) {
            httpParams.push({ params: query })
        } else {
            httpParams.push(body)
        }
        return http[httpMethod](...httpParams)
    }
}