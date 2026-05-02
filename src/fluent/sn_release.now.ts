import { Table, StringColumn, DateColumn, IntegerColumn } from '@servicenow/sdk/core'

export const x_9274_axm_lite_sn_release = Table({
    name: 'x_9274_axm_lite_sn_release',
    label: 'ServiceNow Release',
    display: 'name',
    accessibleFrom: 'public',
    schema: {
        name: StringColumn({
            label: 'Release Name',
            maxLength: 50,
            mandatory: true,
            unique: true,
        }),
        code: StringColumn({
            label: 'Release Code',
            maxLength: 20,
            mandatory: true,
            unique: true,
            hint: 'Lowercase slug used in URLs and API references, e.g. "zurich", "washington-dc"',
        }),
        ga_date: DateColumn({
            label: 'General Availability Date',
            mandatory: true,
        }),
        sequence: IntegerColumn({
            label: 'Sequence',
            mandatory: true,
            hint: 'Monotonically increasing ordinal (Aspen=1, Berlin=2, … Zurich=26). Use for numeric ordering and version comparison.',
            min: 1,
        }),
    },
})
