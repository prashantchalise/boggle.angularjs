﻿using System;
using System.ComponentModel.DataAnnotations;

namespace BogglePC.Model
{
    public interface IAuditableEntity
    {
        DateTime? CreatedDate { get; set; }

        string CreatedBy { get; set; }

        DateTime? UpdatedDate { get; set; }

        string UpdatedBy { get; set; }

        string DeletedBy { get; set; }

        DateTime? DeletedDate { get; set; }
    }

    public abstract class AuditableEntity<T> : Entity<T>, IAuditableEntity
    {
        [ScaffoldColumn(false)]
        public DateTime? CreatedDate { get; set; }


        [MaxLength(256)]
        [ScaffoldColumn(false)]
        public string CreatedBy { get; set; }

        [ScaffoldColumn(false)]
        public DateTime? UpdatedDate { get; set; }

        [MaxLength(256)]
        [ScaffoldColumn(false)]
        public string UpdatedBy { get; set; }

        [ScaffoldColumn(false)]
        public DateTime? DeletedDate { get; set; }

        [MaxLength(256)]
        [ScaffoldColumn(false)]
        public string DeletedBy { get; set; }
    }
}
