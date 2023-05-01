<script>
import Layout from "@/src/layouts/main.vue";
import PageHeader from "@components/page-header";
import appConfig from "../../../../app.config";

import "prismjs";
import "prismjs/themes/prism.css";
import { crudMethods, pageMethods } from "@/src/state/helpers";
import permissions from './permissions.json'

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';


export default {
    page: {
        title: "Peran",
        meta: [{ name: "description", content: appConfig.description }],
    },
    data() {
        return {
            title: "Data peran",
            items: [
                {
                    text: "Setting",
                    href: "/",
                },
                {
                    text: "Data Peran",
                    href: "/setting/dinas"
                },
                {
                    text : 'Tambah Peran',
                    active: true
                }
            ],
            baseURL: process.env.VUE_APP_API_ENDPOINT,
            apiUrl: '/web/setting/peran',
            parentRoutes: '/setting/peran',
            typeCrud: 'insertData',
            permissions: [],
            ownedPermissions: [],
            pkId: null,
            nama: "",
            deskripsi: "",
            logoUrl : null,
            logo: null,
            errors: {
                nama: null,
                deskripsi: null
            }
        };
    },
    components: {
        Layout,
        PageHeader,
    },
    computed: {},
    watch: {
    },
    mounted() {
        this.permissions = JSON.parse(JSON.stringify(permissions))
        // this.permissions.find()

        if (this.$route.params.id) {
            this.pkId = this.$route.params.id
            this.typeCrud = 'updateData'
            this.getDetail()
        }
    },
    methods: {
        ...crudMethods,
        ...pageMethods,
        selectedChild(checked, parent, child) {
            this.permissions.forEach(x => {
                if (x.name === parent) {
                    x.child.forEach(y => {
                       if (y.name === child && y.child) {
                        y.child.forEach(z => {
                            z.selected = checked
                        });
                       }
                    });
                }
            });
        },
        selectedRole(checked, parent, child) {
            if (!checked) {
                this.permissions
                .find((x) => x.name === parent)
                .child.find((y) => y.name === child).selected = checked
            } else {
                const falseValue =
                this.permissions
                    .find((x) => x.name === parent)
                    .child.find((y) => y.name === child)
                    .child.filter((z) => z.selected === false).length - 1

                if (falseValue === 0)
                this.permissions
                    .find((x) => x.name === parent)
                    .child.find((y) => y.name === child).selected = true
            }
        },
        getDetail() {
            this.listData({
                url: `${this.apiUrl}/${this.$route.params.id}`,
            }).then((response) => {
                const { data } = response.data
                this.nama = data.nama;
                // this.ownedPermissions = data.
                let ownedPermissions = []

                data.detail.forEach((item) => {
                    ownedPermissions.push(item.hak_akses.nama)
                })

                this.permissions.forEach((item) => {
                    item.child.forEach((permission) => {
                        if (permission.child) {
                            permission.child.forEach((role) => {
                                if (ownedPermissions.includes(role.name)) role.selected = true
                            })
                        } else {
                            if (ownedPermissions.includes(permission.name)) permission.selected = true
                        }
                    })
                })

                this.permissions.forEach((item) => {
                    item.child.forEach((permission) => {
                        if (permission.child && permission.child.filter((x) => x.selected === false).length === 0)
                            permission.selected = true
                    })
                })
            })
        },
        store() {
            let hakAkses = []
            this.permissions.forEach((item) => {
                item.child.forEach((permission) => {
                    if (permission.child) {
                        permission.child.forEach((role) => {
                            if (role.selected) 
                                hakAkses.push(role.name)
                        })
                    } else {
                        if (permission.selected)
                            hakAkses.push(permission.name)
                    }
                })
            })
            let body = {
                nama: this.nama,
                hak_akseses: hakAkses,
            }
            let url = this.apiUrl
            if (this.typeCrud === 'updateData') url = this.apiUrl + `/${this.pkId}`
            this[this.typeCrud]({ url: url, body: body })
            .then((response) => {
            const { data } = response
            if (data) {
                let content = ''
                if (this.typeCrud === 'insertData') {
                    content = this.title + ' berhasil disimpan'
                } else {
                    content = this.title + ' berhasil diperbaharui'
                }
                this.$router.push({ name: 'ListPeran' })
                toast.info(content, {
                    position: toast.POSITION.TOP_CENTER,
                    closeButton : false,
                    hideProgressBar: true
                });
            }
            })
            .catch((err) => {
                console.log(err)
                if (err.response.status === 403) {
                    // this.errorMessage = JSON.parse(
                    //   err.response.request.response
                    // ).message;
                } else if (err.response.status === 422) {
                    this.errors = err.response.data.errors
                }
            })
        },
    }
};
</script>

<template>
    <Layout>
        <PageHeader :title="title" :items="items" />
        <b-row>
            <b-col xl="12">
                <b-card no-body>
                    <b-card-header class="align-items-center d-flex">
                        <b-card-title class="mb-0 flex-grow-1">Tambah {{title}}</b-card-title>
                        <div class="flex-shrink-0">
                            <router-link
                                :to="parentRoutes"
                                class="btn btn-sm btn-outline-warning rounded-0 d-flex align-items-center gap-1"
                            >
                                <vue-feather type="arrow-left-circle" size="13"></vue-feather> Kembali
                            </router-link>
                        </div>
                    </b-card-header>
                    <b-card-body>
                        <div class="live-preview">
                            <b-row class="gy-4 mb-2">
                                <b-col xxl="6">
                                    <div>
                                        <label for="nama" class="form-label">Nama Peran</label>
                                        <input v-model="nama" type="text" class="form-control" id="nama">
                                        <span v-if="errors.name" class="text-required">
                                            {{ errors.nama.toString() }}
                                        </span>
                                    </div>
                                </b-col>
                            </b-row>
                            <hr />
                            <b-row class="roles-section-area mb-2">
                                <b-col xxl="12">
                                    <h5>=== Kelola Hak Akses ===</h5>
                                </b-col>
                                <div
                                    v-for="(item, index) in permissions"
                                    :key="index"
                                    class="col-sm-12 roles-section-list"
                                >
                                    <h6>{{ item.description }}</h6>
                                    <div class="row">
                                    <div
                                        v-for="(permission, indexPermission) in item.child"
                                        :key="indexPermission"
                                        class="col-sm-6 permission-row"
                                    >
                                        <b-form-checkbox
                                        v-model="permission.selected"
                                        :value="true"
                                        :unchecked-value="false"
                                        @change="
                                            selectedChild($event, item.name, permission.name)
                                        "
                                        >
                                        {{ permission.description }}
                                        </b-form-checkbox>
                                        <div
                                        v-for="(child, indexChild) in permission.child"
                                        :key="indexChild"
                                        class="permission-list"
                                        >
                                        <b-form-checkbox
                                            v-model="child.selected"
                                            :value="true"
                                            :unchecked-value="false"
                                            @change="
                                            selectedRole(
                                                $event,
                                                item.name,
                                                permission.name,
                                            )
                                            "
                                        >
                                            {{ child.description }}
                                        </b-form-checkbox>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </b-row>
                            <hr />
                            <b-row>
                                <div class="col-sm-12 d-flex justify-content-end gap-2">
                                    <router-link :to="`${parentRoutes}`" class="btn btn-outline-danger rounded-0 d-flex align-items-center gap-1">
                                       <vue-feather type="x-circle" size="13"></vue-feather> Batal
                                    </router-link>
                                    <button class="btn btn-outline-primary rounded-0 d-flex align-items-center gap-1" @click="store">
                                        <vue-feather type="save" size="13"></vue-feather> Simpan
                                    </button>
                                </div>
                            </b-row>
                        </div>
                    </b-card-body>
                </b-card>
            </b-col>
        </b-row>
    </Layout>
</template>
<style lang="scss">
.roles-section-area {
    h5 {
        text-transform: uppercase;
        font-size: 18px;
        font-weight: 600;
        line-height: 20px;
        margin: 0px;
        margin-bottom: 20px;

    }
    .roles-section-list {
    
        h6 {
            text-transform: uppercase;
            font-size: 14px;
            font-weight: 600;
            line-height: 14px;
            margin: 0px;
            margin-bottom: 18px;

        }

        .permission-row {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 16px;

            .custom-checkbox {

                .custom-control-label {
                    &::before {
                        border-radius: 0px;
                    }
                }

                label {
                    // color: $neutral-black-1;
                    font-weight: 600;
                }
            }

            .permission-list {
                padding-left: 10px;

                .custom-checkbox {
                    label {
                        font-weight: 400;
                    }
                }
            }
        }
    }
}
</style>
