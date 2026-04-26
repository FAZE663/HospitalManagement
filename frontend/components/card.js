export default {
  name: "AppointmentCard",

  props: {
    appointment: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      localNotes: this.appointment.notes || ""
    };
  },

  methods: {
    openNotesModal() {
      const modal = new bootstrap.Modal(
        document.getElementById(`notesModal-${this.appointment.id}`)
      );
      modal.show();
    },

    markComplete() {
      if (this.appointment.status !== "Completed") {
        this.$emit("update-status", this.appointment.id, "Completed");
      }
    },

    saveNotes() {
      this.$emit("save-notes", this.appointment.id, this.localNotes);
      const modal = bootstrap.Modal.getInstance(
        document.getElementById(`notesModal-${this.appointment.id}`)
      );
      modal.hide();
    }
  },

  template: `
  

    <!-- Notes Modal -->
    <div class="modal fade" id="modalId" tabindex="-1" aria-labelledby="notesLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title" id="notesLabel">
              Notes for {{ appointment.customer_name }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <textarea
              v-model="localNotes"
              class="form-control"
              rows="5"
              placeholder="Enter or view notes..."
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Close
            </button>
            <button type="button" class="btn btn-primary" @click="saveNotes">
              <i class="bi bi-save"></i> Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  
  `
};
