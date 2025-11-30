<script lang="ts">
    import { page } from '$app/state';

    let categoryId = $state(page.params.categoryId);
</script>

<div class="container">
    <h1>Category: {categoryId}</h1>
    <!-- Add your category products listing here -->
</div>
