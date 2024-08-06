<template>
  <q-layout class="q-pt-xl">
    <q-page-container class="q-pt-xl">
      <q-page class="column items-center">
        <div>Add points in format "lat, lng, radius".</div>
        <div>Example: "34.682, 33.062, 1000".</div>
        <q-form
          class="row q-my-md"
          @submit="addPoint"
        >
          <q-input
            v-model="point"
            label="Input"
            outlined
          />
          <q-btn
            color="primary"
            label="Add point"
            type="submit"
            style="height: 56px"
          />
        </q-form>
        <div v-if="points.length">
          Active points:
          <ul class="q-pa-none">
            <li v-for="item in points" :key="item.identifier">
              lat: {{ item.latitude }}, lng: {{ item.longitude }}, rad: {{ item.radius }}
            </li>
          </ul>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';

import BackgroundGeolocation from '@transistorsoft/capacitor-background-geolocation';

const $q = useQuasar();

const point = ref('');
const points = ref([]);

async function addPoint() {
  const [latitude, longitude, radius] = point.value.split(', ').map((item) => +item);

  if (latitude && longitude && radius) {
    const value = {
      identifier: Math.floor(Math.random() * 1_000),
      radius,
      latitude,
      longitude,
      notifyOnEntry: true,
    };

    try {
      await BackgroundGeolocation.addGeofence(value);
      points.value.push(value);
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
    } finally {
      point.value = '';
    }
  }
}

async function startGeofences() {
  points.value = await BackgroundGeolocation.getGeofences();

  BackgroundGeolocation.onGeofence((_, taskId) => {
    $q.capacitor.Plugins.LocalNotifications.schedule({
      notifications: [{
        id: 1,
        title: 'Book your ride from the airport',
        body: 'Fixed fares with verified drivers. Our pickup is nearby.',
      }],
    });
    BackgroundGeolocation.finish(taskId);
  });

  try {
    await BackgroundGeolocation.ready({
      backgroundPermissionRationale: {
        title: 'Allow App access location in the background?',
        message: 'App collects location data, even if the app is not in use...',
        positiveAction: 'Change to "{backgroundPermissionOptionLabel}"',
        negativeAction: 'Cancel',
      },
      disableLocationAuthorizationAlert: true,
      startOnBoot: true,
      stopOnTerminate: false,
    });

    BackgroundGeolocation.startGeofences();
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
}

onMounted(() => {
  startGeofences();
});
</script>
