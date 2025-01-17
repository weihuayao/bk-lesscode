import './render-param-slot.css'

export default (row, handleUpdate, variableList) => {
    return (
        <bk-compose-form-item class="render-param-form">
            <bk-select
                class="render-param-type"
                value={row.valueType}
                clearable={false}
                onChange={(valueType) => handleUpdate(row, { valueType })}
            >
                <bk-option id="value" name="值"></bk-option>
                <bk-option id="variable" name="变量"></bk-option>
            </bk-select>
            {
                row.valueType === 'variable'
                    ? <bk-select
                        class="render-param-val"
                        placeholder="请选择变量"
                        value={row.code}
                        onChange={(code) => handleUpdate(row, { code })}
                    >
                        {
                            variableList.map((variable) => (
                                <bk-option
                                    id={variable.variableCode}
                                    name={variable.variableName}
                                ></bk-option>
                            ))
                        }
                    </bk-select>
                    : row.type === 'boolean'
                        ? <bk-checkbox
                            class="render-param-val"
                            value={row.value}
                            onChange={(val) => handleUpdate(row, { value: val })}
                        ></bk-checkbox>
                        : <bk-input
                            class="render-param-val"
                            placeholder="请输入参数值"
                            value={row.value}
                            onChange={(val) => handleUpdate(row, { value: val })}
                        >
                        </bk-input>
            }
        </bk-compose-form-item>
    )
}
