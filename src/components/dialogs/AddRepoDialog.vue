<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-form @submit="onOKClick" @reset="onReset">
        <q-card-section class="row">
          <div class="text-h6">New Repository</div>
          <q-space />
          <q-btn flat round dense icon="close" @click="onCancelClick" />
        </q-card-section>

        <q-card-section class="q-gutter-xs">
          <q-input
            v-model="name"
            dense
            outlined
            label="Name *"
            lazy-rules
            :rules="nameRules"
          />
          <q-input
            v-model="bucketName"
            dense
            outlined
            label="S3 Bucket Name *"
            lazy-rules
            :rules="bucketNameRules"
          />
          <q-input
            v-model="description"
            dense
            outlined
            type="textarea"
            label="Description"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="primary" label="Reset" type="reset" flat />
          <q-btn color="primary" label="Add" type="submit" padding="xs md" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useDialogPluginComponent } from 'quasar'

export default defineComponent({
  emits: [...useDialogPluginComponent.emits],

  setup () {
    const {
      dialogRef,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    } = useDialogPluginComponent()

    const name = ref(null)
    const bucketName = ref(null)
    const description = ref(null)

    return {
      name,
      nameRules: [(val) => !!val || 'Required'],
      bucketName,
      bucketNameRules: [
        (val) => !!val || 'Required',
        // TODO: validate bucket name format
      ],
      description,
      dialogRef,
      onDialogHide,
      onOKClick () {
        onDialogOK({
          name: name.value,
          bucketName: bucketName.value,
          description: !description.value ? '' : description.value,
        })
      },
      onReset () {
        name.value = null
        bucketName.value = null
        description.value = null
      },
      onCancelClick: onDialogCancel,
    }
  },
})
</script>
