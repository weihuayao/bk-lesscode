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
    Controller,
    Ctx,
    Post,
    BodyParams,
    PathParams,
    QueryParams,
    OutputJson
} from '../decorator'
import dataService from '../service/data-service'
import http from '../util/http/index'
import {
    METHODS_WITHOUT_DATA
} from '../../shared/constant'
 
@Controller('/api/nocode')
export default class NoCodeController {
    @OutputJson()
    @Post('/proxy/itsm/*')
    async itsmProxyApi (
        @Ctx({ name: 'method' }) method,
        @Ctx({ name: 'captures' }) captures,
        @BodyParams() body,
        @QueryParams() query
    ) {
        const httpMethod = method.toLowerCase()
        const httpUrl = captures.join('/')
        const httpParams = [httpUrl]
        if (METHODS_WITHOUT_DATA.includes(httpMethod)) {
            httpParams.push({ params: query })
        } else {
            httpParams.push(body)
        }
        const { result, data, message } = await http[httpMethod](...httpParams)
        if (result) {
            return data
        } else {
            throw new global.BusinessError(message, -1)
        }
    }

    // itsm 回写接口
    @OutputJson()
    @Post('/user/itsmCallBack')
    async itsmCallBack (
        @BodyParams() data
    ) {
        const result = []
        // toadd 解析
        return result
    }

    // 数据筛选接口
    @OutputJson()
    @Post('/filterTableData/keys/formId/:formId/tableName/:tableName')
    filterTableDataWithKeys (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @QueryParams({ name: 'page' }) page,
        @QueryParams({ name: 'pageSize' }) pageSize,
        @BodyParams() query
    ) {
        return dataService.get({
            tableFileName: tableName,
            page,
            pageSize,
            query
        })
    }

    // 表单数据源
    @OutputJson()
    @Post('/filterTableData/conditions/formId/:formId/tableName/:tableName')
    async filterTableDataWithConditions (
        @PathParams({ name: 'tableName', require: true }) tableName,
        @BodyParams() conditions
    ) {
        const result = []
        // to add 解析 conditions
        return result
    }
}