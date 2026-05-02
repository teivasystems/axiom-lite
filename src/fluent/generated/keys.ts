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
                        deleted: true
                    }
                    cs0: {
                        table: 'sys_script_client'
                        id: 'a171b312291b4543a10bde8b3c400709'
                        deleted: true
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'f7f74e59f19f466bb8b3514cb557f06b'
                    }
                    'release-aspen': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: 'be89eb3338d14623a9816083c463b816'
                    }
                    'release-berlin': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '55bc559f625748d2b5bfc952ea791462'
                    }
                    'release-calgary': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '23d8b8e017014db2a828dcef150a5462'
                    }
                    'release-dublin': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '05dcd59c43ce4481b4b1bed608459b15'
                    }
                    'release-eureka': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '75fda432ca5744399eae23573e963124'
                    }
                    'release-fuji': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '847c9efa341f4197b0dac37124eba62a'
                    }
                    'release-geneva': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: 'a4a977e35d2647b8a08488c0662f60c9'
                    }
                    'release-helsinki': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '35ce2384f74c4d979107e5ad84d1a75f'
                    }
                    'release-istanbul': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '7d7c7d897e5547f689b1135217f02082'
                    }
                    'release-jakarta': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: 'a528ecfa424a4b209187555527af20bc'
                    }
                    'release-kingston': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '2e3df36186c44bf1b0fe4e6851820b75'
                    }
                    'release-london': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: 'fd1c8c1058d64e22bcd5d1cf44ed9ed5'
                    }
                    'release-madrid': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '79dc603eae5c436d9cc3f042c7009646'
                    }
                    'release-new-york': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '3d058b4947d045cfa00e544340de172d'
                    }
                    'release-orlando': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: 'c007824936d94b5398fad347dd3e209b'
                    }
                    'release-paris': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '17d7d72f98a448d291b2d2b99d2a873d'
                    }
                    'release-quebec': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '6a31d3694fc84b7ab7fd87ff90b03a6c'
                    }
                    'release-rome': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '3d851fcb08ab458489805ccf33279a4e'
                    }
                    'release-san-diego': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: 'f9bc033b053c49e68c82eb2168e0ed3e'
                    }
                    'release-tokyo': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '1df741ca4a394453983ea8ad9bada1e6'
                    }
                    'release-utah': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '59de5b90e3964ed68d75e4182c60eab6'
                    }
                    'release-vancouver': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '2969fe2fb1264417b7f87017b7423acb'
                    }
                    'release-washington-dc': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: 'b64648e32838406482c76bb9ef2dedfe'
                    }
                    'release-xanadu': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '0cd0e7dc50014745b2e7dbdca533cd65'
                    }
                    'release-yokohama': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '2b7d29c6ab774a959805e6508471dfab'
                    }
                    'release-zurich': {
                        table: 'x_9274_axm_lite_sn_release'
                        id: '0b0ded68da904c13a1a1419f436dbab6'
                    }
                    src_server_script_ts: {
                        table: 'sys_module'
                        id: 'e7262d8c3cc94e23ab6ccbd98e8599de'
                        deleted: true
                    }
                }
                composite: [
                    {
                        table: 'sys_dictionary'
                        id: '186ac7ce75c641dfb8141cfbbe942c73'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'ga_date'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '27e12da8d5f34cd09a3a9b4469f21c73'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '34fd4d41d7194194a3d34cd9f1a7a5e9'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3876750b9ac949b0bc8eb8fd0ebd4799'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'ga_date'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '40448eda6be1444a8f374eba77897eca'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '44534e8ed2004d659d32c0d39ad57e75'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'ga_date'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5cab153724fe450e99f5724aca2068e4'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'sequence'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7ec27e49c61e45d495fde046121308a5'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '964b1b8879444bd0808473901ec5834a'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'code'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a04e11e9b5204056810bbb85106467f1'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'sequence'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a19d202e4fe74101ad2c87b4fed99147'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'a4e46ec11e8a4bbaaf9b17f43aa2f300'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'aaaa39add98e46b99a4ef3f9549a553f'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'code'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'aaf62adc52f04a4c9874416130bc6ffc'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'aeb90fa7fd5f4a698dfd6852e3e9caa4'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b1d492dbb4004aa9a83519f807326685'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bb4bc907790245548cc1fd03da2b47cd'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'sequence'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cc4514d59f6e40bb84bf70df8bc4b515'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'd0ed3f594eb1473ba200c4620b000606'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd9b4b9f4b18b47129bf6b0dd7beb9b80'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'sequence'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e37195e183d94ee49d06ae7ce69a3e4e'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'code'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ef464341e6c640b19c535ecd43632a5a'
                        deleted: true
                        key: {
                            name: 'x_snc_axm_lite_sn_release'
                            element: 'code'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f69de40ed5c14810bdaf782d12c3ecd6'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'ga_date'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f877115e3c8249b4b62313777fa93c97'
                        key: {
                            name: 'x_9274_axm_lite_sn_release'
                            element: 'name'
                            language: 'en'
                        }
                    },
                ]
            }
        }
    }
}
