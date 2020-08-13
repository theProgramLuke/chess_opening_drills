<template>
  <v-container class="fill-height">
    <v-row class="fill-height">
      <v-col dense xs="3" sm="3" md="3" lg="3" xl="3">
        <v-treeview
          :items="repertoireTags"
          @update:active="selectTag"
          activatable
          dense
          hoverable
        >
        </v-treeview>
      </v-col>
      <v-col>{{ position }}</v-col>
    </v-row>
    <v-row></v-row>
  </v-container>
</template>

<script lang="ts">
import { mapState } from "vuex";

export default {
  data: () => ({
    position: ""
  }),
  computed: mapState(["repertoireTags"]),
  methods: {
    selectTag(activeIds: Array<number>) {
      function findChild(obj: any, id: number): any {
        if (obj["id"] === id) {
          return obj;
        }

        if (obj["children"].length === 0) {
          return null;
        }

        const mapped = obj["children"].map((child: any) =>
          findChild(child, id)
        );
        const filtered = mapped.filter((child: any) => {
          return child != null;
        });

        return filtered[0];
      }

      const child =
        findChild(this.repertoireTags[0], activeIds[0]) ||
        findChild(this.repertoireTags[1], activeIds[0]);

      if (child) {
        this.position = child.position;
      }
    }
  }
};
</script>
