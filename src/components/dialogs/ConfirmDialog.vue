<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Confirm</div>
      </q-card-section>

      <q-card-section>
        <div class="text-body2">{{ message }}</div>
      </q-card-section>

      <q-separator inset />

      <q-card-actions align="right">
        <q-btn color="primary" label="Cancel" flat @click="onCancelClick" />
        <q-btn color="primary" label="OK" flat @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent } from 'vue'
import { useDialogPluginComponent } from 'quasar'

export default defineComponent({
  props: {
    message: {
      type: String,
      default: 'Are you sure?',
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup () {
    const {
      dialogRef,
      onDialogHide,
      onDialogOK,
      onDialogCancel,
    } = useDialogPluginComponent()

    return {
      dialogRef,
      onDialogHide,
      onOKClick () {
        onDialogOK()
      },
      onCancelClick: onDialogCancel,
    }
  },
})
</script>
