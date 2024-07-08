<script setup lang="ts">
import { useAuthStore } from '@/application/AuthStore';
import { useFilesStore } from '@/application/FilesStore';
import { GoogleOutlined, KeyOutlined } from '@ant-design/icons-vue';
import { onMounted, ref, watchEffect } from 'vue';

type TabKey = 'google' | 'password';
type TabItem = { key: TabKey; tab: string };

const authStore = useAuthStore();
const filesStore = useFilesStore();

const activeTabKey = ref<TabKey>('google');
const draftPassword = ref('');

const computeState = () => {
  if (authStore.isLogged && !filesStore.isPasswordSet) {
    activeTabKey.value = 'password';
    return;
  }

  activeTabKey.value = 'google';
};

watchEffect(computeState);
onMounted(computeState);

const tabList: TabItem[] = [
  {
    key: 'google',
    tab: 'Sign In',
  },
  {
    key: 'password',
    tab: 'Password',
  },
];

const handleOk = () => {
  authStore.login();
};
</script>
<template>
  <div class="login-view">
    <a-card
      :tab-list="tabList"
      :active-tab-key="activeTabKey"
      @tabChange="activeTabKey = $event"
      style="width: 400px"
    >
      <template #customTab="item: TabItem">
        <div style="width: 120px">
          <GoogleOutlined v-if="item.key === 'google'" />
          <KeyOutlined v-else-if="item.key === 'password'" />
          {{ item.tab }}
        </div>
      </template>
      <template v-if="activeTabKey === 'google'">
        <div class="tab-content">
          <p class="tab-description">
            Sign in with your Google Drive account to read and store the encrypted files.
          </p>
          <a-button v-if="!authStore.isLogged" @click="handleOk" type="primary">Sign In</a-button>
          <a-button v-if="authStore.isLogged" @click="authStore.logout">Sign Out</a-button>
          <p class="expiration" v-if="!!authStore.getExpirationDate()">
            Your session will expire in {{ authStore.getExpirationDate() }}
          </p>
        </div>
      </template>
      <template v-else-if="activeTabKey === 'password'">
        <div class="tab-content" v-if="!filesStore.isPasswordSet">
          <p class="tab-description">This password cannot be recovered. Keep it safe.</p>
          <div class="form-item">
            <a-input-password v-model:value="draftPassword" />
            <a-button type="primary" @click="filesStore.setPassword(draftPassword)">Apply</a-button>
          </div>
        </div>
        <div class="tab-content" v-else>
          <p class="tab-description">Password is set.</p>
          <a-button @click="filesStore.removePassword">Remove</a-button>
        </div>
      </template>
    </a-card>
  </div>
</template>

<style scoped>
p {
  margin: 0;
  padding: auto;
}

.login-view {
  width: 100%;
  box-sizing: border-box;
  padding: 20px;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tab-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  height: 220px;
}

.tab-description {
  text-align: center;
}

.expiration {
  text-align: center;
  font-size: small;
}

.form-item {
  display: flex;
  gap: 10px;
}
</style>
