import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: 'c79c2c73f7484d869cbd6d68f6df551e'
                    }
                    br0: {
                        table: 'sys_script'
                        id: '9f097b044e014d60bd5413599a06126a'
                    }
                    cs0: {
                        table: 'sys_script_client'
                        id: 'a171b312291b4543a10bde8b3c400709'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'f7f74e59f19f466bb8b3514cb557f06b'
                    }
                    src_server_script_ts: {
                        table: 'sys_module'
                        id: 'e7262d8c3cc94e23ab6ccbd98e8599de'
                    }
                }
            }
        }
    }
}
