import { render, screen } from '@testing-library/react';

// Simple test to verify Jest setup is working
describe('Frontend Test Setup', () => {
  it('should render a simple component', () => {
    // Arrange
    const TestComponent = () => <div>Hello, Test World!</div>;

    // Act
    render(<TestComponent />);

    // Assert
    expect(screen.getByText('Hello, Test World!')).toBeInTheDocument();
  });

  it('should handle basic assertions', () => {
    // Basic assertion tests
    expect(1 + 1).toBe(2);
    expect('hello').toMatch(/ello/);
    expect(['apple', 'banana', 'orange']).toContain('banana');
  });

  it('should work with async operations', async () => {
    // Simple async test
    const asyncFunction = () => Promise.resolve('success');
    const result = await asyncFunction();
    expect(result).toBe('success');
  });
}); 