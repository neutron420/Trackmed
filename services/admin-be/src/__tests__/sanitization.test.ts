import { sanitizeInput, sanitizeObject } from '../validation/middleware';

describe('Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello');
    });

    it('should remove HTML tags', () => {
      const input = '<div><b>Bold</b> text</div>';
      const result = sanitizeInput(input);
      expect(result).toBe('Bold text');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const result = sanitizeInput(input);
      expect(result).toBe('hello world');
    });

    it('should handle normal text', () => {
      const input = 'Normal text without tags';
      const result = sanitizeInput(input);
      expect(result).toBe('Normal text without tags');
    });

    it('should return non-strings as-is', () => {
      const input = 123 as any;
      const result = sanitizeInput(input);
      expect(result).toBe(123);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize nested objects', () => {
      const input = {
        name: '<script>bad</script>John',
        address: {
          city: '<b>Mumbai</b>',
          state: 'Maharashtra',
        },
      };
      
      const result = sanitizeObject(input);
      expect(result.name).toBe('John');
      expect(result.address.city).toBe('Mumbai');
      expect(result.address.state).toBe('Maharashtra');
    });

    it('should sanitize arrays', () => {
      const input = ['<script>bad</script>item1', '<b>item2</b>'];
      const result = sanitizeObject(input);
      expect(result).toEqual(['item1', 'item2']);
    });

    it('should handle mixed content', () => {
      const input = {
        items: ['<b>one</b>', 'two'],
        count: 2,
        nested: {
          value: '<script>x</script>clean',
        },
      };
      
      const result = sanitizeObject(input);
      expect(result.items).toEqual(['one', 'two']);
      expect(result.count).toBe(2);
      expect(result.nested.value).toBe('clean');
    });
  });
});
