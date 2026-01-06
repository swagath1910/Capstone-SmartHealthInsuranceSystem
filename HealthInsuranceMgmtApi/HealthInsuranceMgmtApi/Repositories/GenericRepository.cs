using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using HealthInsuranceMgmtApi.Data;
using HealthInsuranceMgmtApi.Repositories.Interfaces;

namespace HealthInsuranceMgmtApi.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly HealthInsuranceDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public GenericRepository(HealthInsuranceDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.Where(predicate).ToListAsync();
    }

    public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.FirstOrDefaultAsync(predicate);
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities)
    {
        await _dbSet.AddRangeAsync(entities);
        await _context.SaveChangesAsync();
        return entities;
    }

    public virtual async Task UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task DeleteAsync(T entity)
    {
        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task<PagedResult<T>> GetPagedAsync(int pageNumber, int pageSize, string? sortBy = null, bool ascending = true)
    {
        var query = _dbSet.AsQueryable();
        
        // Applied sorting with custom case-sensitive ordering (lowercase first)
        if (!string.IsNullOrEmpty(sortBy))
        {
            var property = typeof(T).GetProperty(sortBy);
            if (property != null)
            {
                if (property.PropertyType == typeof(string))
                {
                    // Custom sorting: lowercase first, then uppercase
                    query = ascending 
                        ? query.OrderBy(x => EF.Property<string>(x, sortBy).ToLower())
                              .ThenBy(x => EF.Property<string>(x, sortBy))
                        : query.OrderByDescending(x => EF.Property<string>(x, sortBy).ToLower())
                              .ThenByDescending(x => EF.Property<string>(x, sortBy));
                }
                else
                {
                    query = ascending 
                        ? query.OrderBy(x => EF.Property<object>(x, sortBy))
                        : query.OrderByDescending(x => EF.Property<object>(x, sortBy));
                }
            }
        }
        
        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
            
        return new PagedResult<T>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
            return await _dbSet.CountAsync();
        
        return await _dbSet.CountAsync(predicate);
    }

    public virtual async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.AnyAsync(predicate);
    }
}
