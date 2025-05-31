describe('Assignments API Integration', () => {
  const baseUrl = 'http://localhost:3001';
  let authToken: string;
  let instructorToken: string;

  beforeAll(async () => {
    // In a real test, you would authenticate and get real tokens
    // For now, we'll use mock tokens
    authToken = 'student-auth-token';
    instructorToken = 'instructor-auth-token';
  });

  describe('GET /api/assignments', () => {
    test('should return assignments for a course', async () => {
      const response = await fetch(`${baseUrl}/api/assignments?courseId=course1`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);

      if (data.data.length > 0) {
        const assignment = data.data[0];
        expect(assignment).toHaveProperty('id');
        expect(assignment).toHaveProperty('title');
        expect(assignment).toHaveProperty('description');
        expect(assignment).toHaveProperty('maxScore');
        expect(assignment).toHaveProperty('courseId');
      }
    });

    test('should return 401 without authentication', async () => {
      const response = await fetch(`${baseUrl}/api/assignments`);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    test('should support pagination', async () => {
      const response = await fetch(`${baseUrl}/api/assignments?page=2&limit=5`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.limit).toBe(5);
    });
  });

  describe('POST /api/assignments', () => {
    test('should create assignment when user is instructor', async () => {
      const newAssignment = {
        title: 'Integration Test Assignment',
        description: 'This is a test assignment created by integration tests',
        courseId: 'course1',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        maxScore: 100,
      };

      const response = await fetch(`${baseUrl}/api/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instructorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data.title).toBe(newAssignment.title);
      expect(data.data.description).toBe(newAssignment.description);
      expect(data.data.courseId).toBe(newAssignment.courseId);
      expect(data.data.maxScore).toBe(newAssignment.maxScore);
    });

    test('should return 403 when student tries to create assignment', async () => {
      const newAssignment = {
        title: 'Student Assignment Attempt',
        description: 'This should fail',
        courseId: 'course1',
      };

      const response = await fetch(`${baseUrl}/api/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      });

      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toBe('Forbidden: Only instructors can create assignments');
    });

    test('should return 400 for missing required fields', async () => {
      const invalidAssignment = {
        description: 'Missing title and courseId',
      };

      const response = await fetch(`${baseUrl}/api/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${instructorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidAssignment),
      });

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Bad Request: Missing required fields');
    });
  });

  describe('GET /api/assignments/[id]', () => {
    test('should return assignment details with submissions', async () => {
      const assignmentId = 'assignment1';
      const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('title');
      expect(data.data).toHaveProperty('description');
      expect(data.data).toHaveProperty('submissions');
      expect(Array.isArray(data.data.submissions)).toBe(true);
    });

    test('should return 404 for non-existent assignment', async () => {
      const response = await fetch(`${baseUrl}/api/assignments/non-existent-id`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Assignment not found');
    });
  });

  describe('PUT /api/assignments/[id]', () => {
    test('should update assignment when user is instructor', async () => {
      const assignmentId = 'assignment1';
      const updateData = {
        title: 'Updated Assignment Title',
        description: 'Updated description for integration test',
      };

      const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${instructorToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.title).toBe(updateData.title);
      expect(data.data.description).toBe(updateData.description);
    });

    test('should return 403 when student tries to update', async () => {
      const assignmentId = 'assignment1';
      const updateData = {
        title: 'Student Update Attempt',
      };

      const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toBe('Forbidden: Only instructors can update assignments');
    });
  });

  describe('DELETE /api/assignments/[id]', () => {
    test('should delete assignment when user is instructor', async () => {
      const assignmentId = 'assignment-to-delete';
      const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${instructorToken}`,
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Assignment deleted successfully');
    });

    test('should return 403 when student tries to delete', async () => {
      const assignmentId = 'assignment1';
      const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toBe('Forbidden: Only instructors can delete assignments');
    });
  });
});