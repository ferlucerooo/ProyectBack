async function updateRole(userId) {
    const newRole = document.getElementById(`role-${userId}`).value;

    console.log('User ID:', userId); // Verifica si el ID es correcto
    console.log('New Role:', newRole); // Verifica si el rol es correcto

    try {
        const response = await fetch(`/api/users/role/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ role: newRole }),
        });

        if (response.ok) {
            alert('Rol actualizado correctamente');
            // location.reload(); // Descomentar si quieres recargar la página
        } else {
            const errorResponse = await response.json();
            console.error('Error al actualizar el rol:', errorResponse);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
}

async function deleteUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Usuario eliminado correctamente');
            location.reload();  // Recarga la página para actualizar la lista de usuarios
        } else {
            const errorData = await response.json();
            console.error('Error al eliminar el usuario:', errorData);
            alert(`Error al eliminar el usuario: ${errorData.message || 'Error desconocido'}`);
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
        alert(`Error en la solicitud: ${error.message}`);
    }
}